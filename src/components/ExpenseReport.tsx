import React, { Component } from "react";

import axios from "axios";

import "./ExpenseReport.css";

export type Rates = Record<string, number>;

export interface Receipt {
  description: string;
  amount: number;
  currency: string;
  CADValue: number;
}

class ExpenseReport extends Component<{}, State> {
  state = {
    form: {
      description: "",
      amount: 0,
      currency: "CAD"
    },
    currencies: [],
    receipts: [],
    rates: {}
  };

  async componentDidMount() {
    const url = "https://api.exchangeratesapi.io/latest?base=CAD";
    try {
      const {
        data: { rates }
      }: { data: { rates: Rates } } = await axios.get(url);
      this.setState({ rates, currencies: Object.keys(rates) });
    } catch (e) {
      console.log("Error fetching currency rates.", e);
    }
  }

  convertToCAD = (amount: number, currency: string) => {
    const { rates }: { rates: Rates } = this.state;
    return rates[currency] * amount;
  };

  totalExpenses = () => {
    const { receipts } = this.state as any;
    let total = 0;
    receipts.map((receipt: any) => (total += receipt.CADValue));
    return total;
  };

  isButtonDisabled = () => this.totalExpenses() > 1000;

  onChange = (key: string, value: string | number) => {
    this.setState({
      form: {
        ...this.state.form,
        [key]: value
      }
    });
  };

  submitReceipt = (e: any) => {
    e.preventDefault();

    if (this.totalExpenses() > 1000) {
      return "Total expenses should be less than CAD $1000";
    }

    const { receipts, form } = this.state;
    const CADValue = this.convertToCAD(form.amount, form.currency);
    this.setState({ receipts: [...receipts, { ...form, CADValue }] });
  };

  submitExpenseReport = (e: any) => {
    const { receipts } = this.state;
    console.log({ receipts });
  };

  render() {
    const { currencies, receipts, form } = this.state;

    return (
      <div>
        <h1>Expense Report</h1>

        <form className="receipt-form" onSubmit={this.submitReceipt}>
          <div>
            <label htmlFor="form-description">Description</label>
            <input
              onChange={e => this.onChange("description", e.target.value)}
              id="form-description"
              type="text"
              value={form.description}
            />
          </div>
          <div>
            <label htmlFor="form-description">Amount</label>
            <input
              onChange={e => this.onChange("amount", Number(e.target.value))}
              id="form-amount"
              type="number"
              value={form.amount}
            />
          </div>
          <div>
            <label htmlFor="form-currency">Currency</label>
            <select
              value={form.currency}
              onChange={e => this.onChange("currency", e.target.value)}
              name="currency"
              id="currency"
            >
              {currencies.map(currency => (
                <option value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div>$CAD: {this.convertToCAD(form.amount, form.currency)}</div>
          <button type="submit">Submit Receipt</button>
        </form>

        <div className="receipts-list">
          <h3>Receipts List</h3>
          <div>
            {receipts.map((receipt: Receipt) => (
              <div>
                <div>{receipt.description}</div>
                <div>{receipt.amount}</div>
                <div>{receipt.currency}</div>
                <div>{receipt.CADValue}</div>
              </div>
            ))}
          </div>
          <div>Total Expenses: {this.totalExpenses()}</div>
        </div>

        <button
          type="button"
          disabled={this.isButtonDisabled()}
          onClick={this.submitExpenseReport}
        >
          Submit Expense Report
        </button>

        {this.isButtonDisabled() && (
          <div>Expense report limit has been exceeded.</div>
        )}
      </div>
    );
  }
}

interface State {
  form: Partial<Receipt>;
  receipts: Receipt[];
  rates: Rates;
  currencies: string[];
}

export default ExpenseReport;
