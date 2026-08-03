import type { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "Wedding Design Investment Calculator",
  description: "Explore your personalized investment tier and discover how Lady Victoria Designs brings your wedding or private celebration to life in the DC Metro area.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return <QuizClient />;
}
