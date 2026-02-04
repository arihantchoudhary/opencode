import { Match, Switch } from "solid-js"

export const plans = [
  {
    id: "0",
    name: "Free",
    features: [
      "Use 1 model concurrently",
      "5 tickets per month",
      "1 GitHub repo",
      "Community support",
    ],
  },
  {
    id: "14",
    name: "Plus",
    features: [
      "Use 3 models concurrently",
      "50 tickets per month",
      "5 GitHub repos",
      "Email support",
    ],
  },
  {
    id: "29",
    name: "Pro",
    features: [
      "Use 9 models concurrently",
      "Unlimited tickets",
      "Unlimited GitHub repos",
      "Priority support",
      "Preview deployments",
    ],
  },
  {
    id: "enterprise",
    name: "Max",
    features: [
      "Custom plans",
      "Unlimited models",
      "Unlimited tickets",
      "Unlimited repos",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees",
    ],
  },
] as const

export type PlanID = (typeof plans)[number]["id"]
export type Plan = (typeof plans)[number]
