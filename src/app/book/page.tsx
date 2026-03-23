import type { Metadata } from "next";
import { BookDemoFlow } from "@/app/book/book-demo-flow";

export const metadata: Metadata = {
  title: "Book a Demo | OVRMN",
  description:
    "Tell OVRMN a bit about your team and book a tailored demo.",
};

export default function BookPage() {
  return <BookDemoFlow />;
}
