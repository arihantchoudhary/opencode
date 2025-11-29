import z from "zod"
import { Tool } from "./tool"
import DESCRIPTION from "./calculator.txt"
import { Log } from "../util/log"

const log = Log.create({ service: "calculator-tool" })

export const CalculatorTool = Tool.define("calculator", {
  description: DESCRIPTION,
  parameters: z.object({
    expression: z.string().describe("The mathematical expression to evaluate"),
  }),
  async execute(args, ctx) {
    const { expression } = args

    try {
      // Replace common mathematical notation
      let processedExpression = expression
        .replace(/\^/g, "**") // Replace ^ with ** for exponentiation
        .replace(/\bpi\b/gi, "Math.PI")
        .replace(/\be\b/gi, "Math.E")

      // Replace function names with Math object methods
      const functions = ["sin", "cos", "tan", "sqrt", "abs", "log", "log10", "exp", "floor", "ceil", "round"]
      functions.forEach((func) => {
        const regex = new RegExp(`\\b${func}\\s*\\(`, "gi")
        processedExpression = processedExpression.replace(regex, `Math.${func}(`)
      })

      // Safely evaluate the expression
      const result = Function(`"use strict"; return (${processedExpression})`)()

      // Handle special cases
      if (typeof result === "number") {
        if (!isFinite(result)) {
          if (isNaN(result)) {
            throw new Error("Result is not a number (NaN)")
          }
          throw new Error("Result is infinite - check for division by zero")
        }

        // Format the result nicely
        let formattedResult: string
        if (Number.isInteger(result)) {
          formattedResult = result.toString()
        } else {
          // Round to 10 decimal places to avoid floating point noise
          formattedResult = (Math.round(result * 1e10) / 1e10).toString()
        }

        const output = `${expression} = ${formattedResult}`

        return {
          title: "Calculated: " + expression,
          output,
          metadata: {
            expression,
            result: formattedResult,
            output,
          },
        }
      } else {
        throw new Error("Expression did not evaluate to a number")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      const output = `Error evaluating expression "${expression}": ${errorMessage}`

      log.error("calculator error", {
        sessionID: ctx.sessionID,
        expression,
        error: errorMessage,
      })

      return {
        title: "Calculation Error",
        output,
        metadata: {
          expression,
          result: errorMessage,
          output,
        },
      }
    }
  },
})
