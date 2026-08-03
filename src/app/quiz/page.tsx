import type { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "Investment Calculator & Style Quiz | Lady Victoria Designs",
  description: "Explore your personalized investment tier and discover how Lady Victoria Designs brings your wedding or private celebration to life in the DC Metro area.",
};

export default function QuizPage() {
  return <QuizClient />;
}
