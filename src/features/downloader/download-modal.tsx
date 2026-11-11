"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Download, LoaderCircle } from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { useDownloadJob } from "@/hooks/use-download-job";
import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";

export function DownloadModal({ jobId, open, onOpenChange, onCompleted, locale }: { jobId?: string; open: boolean; onOpenChange: (open: boolean) => void; onCompleted: () => void; locale: Locale }) {
  const copy = UI_CONTENT[locale].modal;
  const { job, error } = useDownloadJob(jobId, copy.followError);
  const [startedJobId, setStartedJobId] = useState<string>();
  useEffect(() => {
    if (job?.status === "completed" && job.downloadUrl) onCompleted();
  }, [job?.status, job?.downloadUrl, onCompleted]);
  const started = jobId !== undefined && startedJobId === jobId;
  const done = job?.status === "completed";
  return <Modal open={open} onOpenChange={onOpenChange} title={done ? copy.ready : copy.preparing} closeLabel={copy.close}><div className="download-modal-body"><div className={`download-orbit ${done ? "done" : ""}`}>{done ? <CheckCircle2/> : <LoaderCircle/>}</div><p>{error ?? (done ? copy.ready : copy.creating)}</p>{job?.progress !== null && job?.progress !== undefined ? <div className="progress-track"><span style={{ width: `${job.progress}%` }}/></div> : <div className="progress-track indeterminate"><span/></div>}{done && job.downloadUrl ? <><small>{started ? copy.sent : copy.instruction}</small><a className="primary-button" href={job.downloadUrl} download onClick={() => jobId && setStartedJobId(jobId)}><Download/>{copy.download}</a></> : !done && <small>{copy.waiting}</small>}{job?.status === "failed" && <button className="secondary-button" onClick={() => onOpenChange(false)}>{copy.close}</button>}</div></Modal>;
}
