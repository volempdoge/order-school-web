import type { StructureColsProps } from "@/types";

export default function StructureCols({ paragph1, paragph2, span, header }: StructureColsProps) {
  return (
    <div className="max-w-96">
      <h3 className="type-h3">{header}</h3>
      <div className="mt-3 text-justify type-body">
        <p>{paragph1}</p>
        <p className="mt-4">
          <span className="font-bold text-primary-strong">{span} </span>
          {paragph2}
        </p>
      </div>
    </div>
  );
}
