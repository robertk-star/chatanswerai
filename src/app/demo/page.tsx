import { redirect } from "next/navigation";

export const metadata = {
  title: "Live Demo | CashOfferChat",
  description: "View the live CashOfferChat demo site.",
};

export default function DemoPage() {
  redirect("https://www.sellmyhousetodayanywhere.com/");
}
