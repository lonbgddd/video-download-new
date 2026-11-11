"use client";
import { CheckCircle2, XCircle } from "lucide-react";
export function Toast({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) { return <div className={`toast ${tone}`} role="status">{tone === "success" ? <CheckCircle2 size={18}/> : <XCircle size={18}/>} {message}</div>; }
