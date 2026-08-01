import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About | Lady Victoria Designs",
};

export default function AboutPage() {
  return <AboutClient />;
}
