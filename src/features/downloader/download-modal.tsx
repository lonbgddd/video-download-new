"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Download, LoaderCircle } from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { useDownloadJob } from "@/hooks/use-download-job";

export function DownloadModal({ jobId, open, onOpenChange, onCompleted }: { jobId?: string; open: boolean; onOpenChange: (open: boolean) => void; onCompleted: () => void }) {
  const { job, error } = useDownloadJob(jobId);
  const [startedJobId, setStartedJobId] = useState<string>();
  useEffect(() => {
    if (job?.status === "completed" && job.downloadUrl) onCompleted();
  }, [job?.status, job?.downloadUrl, onCompleted]);
  const started = jobId !== undefined && startedJobId === jobId;
  const done = job?.status === "completed";
  return <Modal open={open} onOpenChange={onOpenChange} title={done ? "File đã sẵn sàng" : "Đang chuẩn bị tải xuống"}><div className="download-modal-body"><div className={`download-orbit ${done ? "done" : ""}`}>{done ? <CheckCircle2/> : <LoaderCircle/>}</div><p>{error ?? job?.message ?? "Đang tạo tác vụ an toàn..."}</p>{job?.progress !== null && job?.progress !== undefined ? <div className="progress-track"><span style={{ width: `${job.progress}%` }}/></div> : <div className="progress-track indeterminate"><span/></div>}{done && job.downloadUrl ? <><small>{started ? "Đã gửi yêu cầu tải. Kiểm tra mục tải xuống của trình duyệt." : "Nhấn nút bên dưới để truyền file về máy. File không được lưu trên ổ đĩa server."}</small><a className="primary-button" href={job.downloadUrl} download onClick={() => jobId && setStartedJobId(jobId)}><Download/>Tải file về máy</a></> : !done && <small>Tiến trình không xác định được hiển thị ở chế độ chờ, không dùng phần trăm giả.</small>}{job?.status === "failed" && <button className="secondary-button" onClick={() => onOpenChange(false)}>Đóng</button>}</div></Modal>;
}
