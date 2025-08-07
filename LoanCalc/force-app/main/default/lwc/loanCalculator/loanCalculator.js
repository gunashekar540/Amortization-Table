import { LightningElement, track } from 'lwc';
import createLoan from '@salesforce/apex/LoanController.createLoan';

export default class LoanCalculator extends LightningElement {
    name = '';
    principal = 0;
    rate = 0;
    duration = 0;
    @track emiData = [];

    handleReset() {
        this.name = '';
        this.principal = '';
        this.rate = '';
        this.duration = '';
        this.calculations = [];

        this.emiData = [];
    }


    handleInput(event) {
        const { label, value } = event.target;
        if (label === 'Name') this.name = value;
        else if (label === 'Principal Amount') this.principal = parseFloat(value);
        else if (label === 'Annual Interest Rate (%)') this.rate = parseFloat(value);
        else if (label === 'Duration (in months)') this.duration = parseInt(value, 10);
    }

    handleSubmit() {
        if (!this.name || !this.principal || !this.rate || !this.duration) {
            alert('Please fill all fields');
            return;
        }

        createLoan({
            name: this.name,
            principal: this.principal,
            rate: this.rate,
            duration: this.duration
        })
            .then(() => {
                this.calculateEMI();
            })
            .catch(error => {
                console.error('Error saving loan:', error);
            });
    }

    calculateEMI() {
        const P = this.principal;
        const r = this.rate / 12 / 100;
        const n = this.duration;

        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        let balance = P;
        this.emiData = [];

        for (let i = 1; i <= n; i++) {
            const startingBalance = balance;
            const interest = balance * r;
            const principalPaid = emi - interest;
            balance -= principalPaid;

            this.emiData.push({
                month: i,
                startingBalance: startingBalance.toFixed(2),
                emi: emi.toFixed(2),
                interest: interest.toFixed(2),
                principal: principalPaid.toFixed(2),
                endingBalance: balance > 0 ? balance.toFixed(2) : '0.00'
            });
        }
    }

}