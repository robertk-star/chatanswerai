import { redirect } from "next/navigation";

export const metadata = {
  title: "Live Demo | ChatAnswerAI",
  description: "View the live ChatAnswerAI demo site.",
};

export default function DemoPage() {
  redirect("https://www.sellmyhousetodayanywhere.com/");
}
