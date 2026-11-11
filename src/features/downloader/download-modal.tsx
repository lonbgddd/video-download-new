"use client";
import { useEffect } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { useDownloadJob } from "@/hooks/use-download-job";

export function DownloadModal({ jobId, open, onOpenChange, onCompleted }: { jobId?: string; open: boolean; onOpenChange: (open: boolean) => void; onCompleted: () => void }) {
  const { job, error } = useDownloadJob(jobId);
  useEffect(() => {
    if (job?.status === "completed" && job.downloadUrl) { onCompleted(); const timer = setTimeout(() => { window.location.assign(job.downloadUrl!); }, 500); return () => clearTimeout(timer); }
  }, [job?.status, job?.downloadUrl, onCompleted]);
  const done = job?.status === "completed";
  return <Modal open={open} onOpenChange={onOpenChange} title={done ? "File đã sẵn sàng" : "Đang chuẩn bị tải xuống"}><div className="download-modal-body"><div className={`download-orbit ${done ? "done" : ""}`}>{done ? <CheckCircle2/> : <LoaderCircle/>}</div><p>{error ?? job?.message ?? "Đang tạo tác vụ an toàn..."}</p>{job?.progress !== null && job?.progress !== undefined ? <div className="progress-track"><span style={{ width: `${job.progress}%` }}/></div> : <div className="progress-track indeterminate"><span/></div>}<small>{done ? "Tải xuống sẽ bắt đầu tự động." : "Tiến trình không xác định được hiển thị ở chế độ chờ, không dùng phần trăm giả."}</small>{job?.status === "failed" && <button className="secondary-button" onClick={() => onOpenChange(false)}>Đóng</button>}</div></Modal>;
}
