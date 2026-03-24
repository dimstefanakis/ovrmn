import type { Metadata } from "next";
import { BookDemoFlow } from "@/app/book/book-demo-flow";
import { MetaViewContent } from "@/components/meta-view-content";

export const metadata: Metadata = {
  title: "Book a Demo | OVRMN",
  description:
    "Tell OVRMN a bit about your team and book a tailored demo.",
};

export default function BookPage() {
  return (
    <>
      <MetaViewContent
        contentCategory="Booking flow"
        contentName="OVRMN book demo"
      />
      <BookDemoFlow />
    </>
  );
}
