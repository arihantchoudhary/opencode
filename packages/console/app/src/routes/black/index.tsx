import { A } from "@solidjs/router"
import { Title } from "@solidjs/meta"
import { For } from "solid-js"
import { plans } from "./common"

export default function Black() {
  return (
    <>
      <Title>Stardrop — Pricing</Title>
      <section data-slot="cta">
        <div data-slot="pricing">
          <For each={plans}>
            {(plan) => (
              <div data-slot="pricing-card">
                <div data-slot="card-header">
                  <span data-slot="plan-name">{plan.name}</span>
                  <p data-slot="price">
                    {plan.id === "enterprise" ? (
                      <span data-slot="amount">Enterprise</span>
                    ) : (
                      <>
                        <span data-slot="amount">${plan.id}</span>
                        {plan.id !== "0" && (
                          <span data-slot="period">/mo</span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                <ul data-slot="features">
                  <For each={plan.features}>
                    {(feature) => (
                      <li>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.3 4.3L6 11.6L2.7 8.3"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        {feature}
                      </li>
                    )}
                  </For>
                </ul>
                <div data-slot="card-footer">
                  {plan.id === "enterprise" ? (
                    <a
                      href="mailto:stardroplin@stanford.edu"
                      data-slot="signup-btn"
                      data-variant="secondary"
                    >
                      Contact Us
                    </a>
                  ) : (
                    <A
                      href={plan.id === "0" ? "/black/subscribe/free" : `/black/subscribe/${plan.id}`}
                      data-slot="signup-btn"
                    >
                      Sign Up
                    </A>
                  )}
                </div>
              </div>
            )}
          </For>
        </div>
        <p data-slot="fine-print" style={{ "view-transition-name": "fine-print" }}>
          Prices shown don't include applicable tax · <A href="/legal/terms-of-service">Terms of Service</A>
        </p>
      </section>
    </>
  )
}
