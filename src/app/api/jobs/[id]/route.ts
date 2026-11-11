import { fail, ok } from "@/lib/api-response";
import { jobService } from "@/services/jobs/job-service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; return ok({ job: jobService.get(id) }); }
  catch (error) { return fail(error); }
}
