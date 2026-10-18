import { ToConfirm } from "@/components/ToConfirm";
import type { PipelineStage } from "@/lib/types";

/**
 * The pipeline as a horizontal sequence on wide screens and a vertical one
 * on phones. Stages are genuinely ordered, which is why they are numbered.
 */
export function PipelineDiagram({ stages }: { stages: PipelineStage[] }) {
  if (stages.length === 0) return null;

  return (
    <ol className="grid gap-x-8 gap-y-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
      {stages.map((stage, index) => (
        <li key={stage.stage} className="relative">
          <div className="flex items-center gap-3">
            <span className="font-mono text-micro text-ember">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-ember/50 to-transparent" />
          </div>
          <p className="mt-3 text-h4 font-semibold text-ink">{stage.stage}</p>
          {stage.detail && (
            <p className="mt-2 text-small leading-relaxed text-ink-soft">
              <ToConfirm text={stage.detail} />
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
