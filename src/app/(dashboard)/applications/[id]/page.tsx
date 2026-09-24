import React from "react";
import { notFound } from "next/navigation";
import { getApplicationById } from "@/actions/applications";
import { ApplicationDetailView } from "@/components/applications/application-detail-view";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  try {
    const app = await getApplicationById(id);
    return {
      title: `${app.company} (${app.role}) - JobTrackr`,
      description: `Application details and timeline for ${app.role} at ${app.company}.`,
    };
  } catch {
    return {
      title: "Application Details - JobTrackr",
    };
  }
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;

  let application;
  try {
    application = await getApplicationById(id);
  } catch {
    notFound();
  }

  if (!application) {
    notFound();
  }

  return <ApplicationDetailView application={application} />;
}
