import { createSignal, For } from "solid-js"

export default function CalculatorApp() {
  const [display, setDisplay] = createSignal("0")
  const [previousValue, setPreviousValue] = createSignal<string | null>(null)
  const [operation, setOperation] = createSignal<string | null>(null)
  const [waitingForNewValue, setWaitingForNewValue] = createSignal(false)

  const buttons = [
    { value: "C", type: "clear" },
    { value: "±", type: "toggle" },
    { value: "%", type: "operator" },
    { value: "÷", type: "operator" },
    { value: "7", type: "number" },
    { value: "8", type: "number" },
    { value: "9", type: "number" },
    { value: "×", type: "operator" },
    { value: "4", type: "number" },
    { value: "5", type: "number" },
    { value: "6", type: "number" },
    { value: "−", type: "operator" },
    { value: "1", type: "number" },
    { value: "2", type: "number" },
    { value: "3", type: "number" },
    { value: "+", type: "operator" },
    { value: "0", type: "number", wide: true },
    { value: ".", type: "decimal" },
    { value: "=", type: "equals" },
  ]

  const inputNumber = (num: string) => {
    if (waitingForNewValue()) {
      setDisplay(num)
      setWaitingForNewValue(false)
    } else {
      setDisplay(display() === "0" ? num : display() + num)
    }
  }

  const inputDecimal = () => {
    if (waitingForNewValue()) {
      setDisplay("0.")
      setWaitingForNewValue(false)
    } else if (display().indexOf(".") === -1) {
      setDisplay(display() + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNewValue(false)
  }

  const toggleSign = () => {
    const newValue = parseFloat(display()) * -1
    setDisplay(newValue.toString())
  }

  const percentage = () => {
    const newValue = parseFloat(display()) / 100
    setDisplay(newValue.toString())
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display())

    if (previousValue() === null) {
      setPreviousValue(display())
    } else if (operation()) {
      const currentValue = previousValue() || "0"
      const newValue = calculate(currentValue, inputValue, operation()!)

      setDisplay(newValue.toString())
      setPreviousValue(newValue.toString())
    }

    setWaitingForNewValue(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: string, secondValue: number, operation: string): number => {
    const first = parseFloat(firstValue)

    switch (operation) {
      case "+":
        return first + secondValue
      case "−":
        return first - secondValue
      case "×":
        return first * secondValue
      case "÷":
        return first / secondValue
      default:
        return secondValue
    }
  }

  const handleButtonClick = (button: any) => {
    switch (button.type) {
      case "number":
        inputNumber(button.value)
        break
      case "decimal":
        inputDecimal()
        break
      case "clear":
        clear()
        break
      case "toggle":
        toggleSign()
        break
      case "operator":
        if (button.value === "%") {
          percentage()
        } else {
          performOperation(button.value)
        }
        break
        performOperation(button.value)
        break
      case "equals":
        if (operation() && previousValue() !== null) {
          const inputValue = parseFloat(display())
          const newValue = calculate(previousValue()!, inputValue, operation()!)
          setDisplay(newValue.toString())
          setPreviousValue(null)
          setOperation(null)
          setWaitingForNewValue(true)
        }
        break
    }
  }

  return (
    <div class="calculator">
      <div class="calculator-display">
        <div class="display-text">{display()}</div>
      </div>
      <div class="calculator-buttons">
        <For each={buttons}>
          {(button) => (
            <button
              class={`calculator-button ${button.type} ${button.wide ? "wide" : ""}`}
              onClick={() => handleButtonClick(button)}
            >
              {button.value}
            </button>
          )}
        </For>
      </div>
      <style jsx>{`
        .calculator {
          max-width: 320px;
          margin: 0 auto;
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .calculator-display {
          background: #000;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: right;
        }

        .display-text {
          font-size: 2.5rem;
          font-weight: 300;
          color: #fff;
          word-wrap: break-word;
          word-break: break-all;
        }

        .calculator-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .calculator-button {
          background: #333;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
          font-weight: 400;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calculator-button:hover {
          background: #444;
          transform: scale(1.05);
        }

        .calculator-button:active {
          transform: scale(0.95);
        }

        .calculator-button.number {
          background: #666;
        }

        .calculator-button.number:hover {
          background: #777;
        }

        .calculator-button.operator {
          background: #ff9500;
        }

        .calculator-button.operator:hover {
          background: #ffad33;
        }

        .calculator-button.clear,
        .calculator-button.toggle,
        .calculator-button.equals {
          background: #a6a6a6;
          color: #000;
        }

        .calculator-button.clear:hover,
        .calculator-button.toggle:hover,
        .calculator-button.equals:hover {
          background: #bfbfbf;
        }

        .calculator-button.wide {
          grid-column: span 2;
          border-radius: 30px;
        }
      `}</style>
    </div>
  )
}
