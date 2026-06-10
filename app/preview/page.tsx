import Preview from "@/clientPages/Preview";
import { Suspense } from "react";

function PreviewLoading() {
  return (
    <main className="min-h-screen bg-[#f9fafb] py-16">
      <div className="container">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-center">
          <p className="text-[#374151]">Loading preview...</p>
        </div>
      </div>
    </main>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <Preview />
    </Suspense>
  );
}
