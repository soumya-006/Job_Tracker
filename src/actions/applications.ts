"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  applicationSchema,
  type ApplicationInput,
} from "@/lib/validations/application";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }
  return session.user.id;
}

export async function getApplications(filters?: {
  search?: string;
  status?: string;
  sortBy?: "appliedDate" | "company" | "salary" | "updatedAt";
  sortOrder?: "asc" | "desc";
}) {
  const userId = await getAuthUserId();

  const where: Record<string, unknown> = { userId };

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { company: { contains: q } },
      { role: { contains: q } },
      { location: { contains: q } },
      { notes: { contains: q } },
    ];
  }

  const orderBy: Record<string, "asc" | "desc"> = {};
  if (filters?.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || "desc";
  } else {
    orderBy.order = "asc";
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: [orderBy, { updatedAt: "desc" }],
    include: {
      statusHistory: {
        orderBy: { changedAt: "desc" },
        take: 1,
      },
    },
  });

  return applications;
}

export async function getApplicationById(id: string) {
  const userId = await getAuthUserId();

  const application = await prisma.application.findFirst({
    where: { id, userId },
    include: {
      statusHistory: {
        orderBy: { changedAt: "desc" },
      },
      resumeAnalyses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  return application;
}

export async function createApplication(data: ApplicationInput) {
  const userId = await getAuthUserId();
  const parsed = applicationSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues?.[0]?.message || "Invalid application data",
    };
  }

  const values = parsed.data;

  try {
    // Count current items in this column to set order
    const count = await prisma.application.count({
      where: { userId, status: values.status },
    });

    const application = await prisma.application.create({
      data: {
        userId,
        company: values.company.trim(),
        role: values.role.trim(),
        jobUrl: values.jobUrl?.trim() || null,
        salary: values.salary?.trim() || null,
        location: values.location?.trim() || null,
        locationType: values.locationType || "Remote",
        status: values.status,
        appliedDate: values.appliedDate ? new Date(values.appliedDate) : (values.status === "APPLIED" ? new Date() : null),
        notes: values.notes?.trim() || null,
        priority: values.priority || "MEDIUM",
        contactName: values.contactName?.trim() || null,
        contactEmail: values.contactEmail?.trim() || null,
        order: count,
      },
    });

    // Create initial status history entry
    await prisma.statusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: null,
        toStatus: application.status,
        note: `Created application in ${application.status}`,
      },
    });

    revalidatePath("/kanban");
    revalidatePath("/applications");
    revalidatePath("/dashboard");

    return { success: true, application };
  } catch (error) {
    console.error("Error creating application:", error);
    return { success: false, error: "Failed to create application." };
  }
}

export async function updateApplication(id: string, data: Partial<ApplicationInput>) {
  const userId = await getAuthUserId();

  try {
    const existing = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Application not found." };
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        company: data.company?.trim(),
        role: data.role?.trim(),
        jobUrl: data.jobUrl !== undefined ? data.jobUrl?.trim() || null : undefined,
        salary: data.salary !== undefined ? data.salary?.trim() || null : undefined,
        location: data.location !== undefined ? data.location?.trim() || null : undefined,
        locationType: data.locationType,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
        notes: data.notes !== undefined ? data.notes?.trim() || null : undefined,
        priority: data.priority,
        contactName: data.contactName !== undefined ? data.contactName?.trim() || null : undefined,
        contactEmail: data.contactEmail !== undefined ? data.contactEmail?.trim() || null : undefined,
      },
    });

    // If status changed in update
    if (data.status && data.status !== existing.status) {
      await prisma.application.update({
        where: { id },
        data: { status: data.status },
      });

      await prisma.statusHistory.create({
        data: {
          applicationId: id,
          fromStatus: existing.status,
          toStatus: data.status,
          note: "Status updated in edit dialog",
        },
      });
    }

    revalidatePath("/kanban");
    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);
    revalidatePath("/dashboard");

    return { success: true, application: updated };
  } catch (error) {
    console.error("Error updating application:", error);
    return { success: false, error: "Failed to update application." };
  }
}

export async function updateApplicationStatus(id: string, newStatus: string, note?: string) {
  const userId = await getAuthUserId();

  try {
    const existing = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Application not found." };
    }

    if (existing.status === newStatus) {
      return { success: true, application: existing };
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
    };

    // If moving to APPLIED for the first time and no appliedDate set, set today
    if (newStatus === "APPLIED" && !existing.appliedDate) {
      updateData.appliedDate = new Date();
    }

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        fromStatus: existing.status,
        toStatus: newStatus,
        note: note || `Moved from ${existing.status} to ${newStatus}`,
      },
    });

    revalidatePath("/kanban");
    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);
    revalidatePath("/dashboard");

    return { success: true, application: updated };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: "Failed to change application status." };
  }
}

export async function deleteApplication(id: string) {
  const userId = await getAuthUserId();

  try {
    const existing = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Application not found." };
    }

    await prisma.application.delete({
      where: { id },
    });

    revalidatePath("/kanban");
    revalidatePath("/applications");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting application:", error);
    return { success: false, error: "Failed to delete application." };
  }
}

export async function reorderApplications(items: { id: string; status: string; order: number }[]) {
  const userId = await getAuthUserId();

  try {
    const updates = items.map((item) =>
      prisma.application.updateMany({
        where: { id: item.id, userId },
        data: {
          status: item.status,
          order: item.order,
        },
      })
    );

    await prisma.$transaction(updates);
    revalidatePath("/kanban");
    return { success: true };
  } catch (error) {
    console.error("Error reordering applications:", error);
    return { success: false, error: "Failed to update order." };
  }
}
