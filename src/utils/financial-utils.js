export const calculateTVM = (target, values, mode = 'END', frequency = 12) => {
    let { n, i, pv, pmt, fv } = values;
    const type = mode === 'BEGIN' ? 1 : 0;

    // Convert annual interest rate to periodic rate
    const r = (i / 100) / frequency;

    if (target === 'fv') {
        if (r === 0) {
            return -(pv + pmt * n);
        }
        const factor = Math.pow(1 + r, n);
        const fvVal = -(pv * factor + pmt * (1 + r * type) * (factor - 1) / r);
        return fvVal;
    }

    if (target === 'pv') {
        if (r === 0) {
            return -(fv + pmt * n);
        }
        const factor = Math.pow(1 + r, -n);
        const pvVal = -(fv * factor + pmt * (1 + r * type) * (1 - factor) / r);
        return pvVal;
    }

    if (target === 'pmt') {
        if (r === 0) {
            return -(pv + fv) / n;
        }
        const factor = Math.pow(1 + r, n);
        const pmtVal = -(pv * factor + fv) / ((1 + r * type) * (factor - 1) / r);
        return pmtVal;
    }

    if (target === 'n') {
        if (r === 0) {
            return -(pv + fv) / pmt;
        }
        // Formula derived from PV formula solving for n
        // PV + PMT/r * (1+r*type) * (1 - (1+r)^-n) + FV * (1+r)^-n = 0
        // This is complex, using a simplified version usually:
        // n = log((PMT*(1+r*type) - FV*r) / (PMT*(1+r*type) + PV*r)) / log(1+r)
        const pmtAdj = pmt * (1 + r * type);
        const num = pmtAdj - fv * r;
        const den = pmtAdj + pv * r;
        const nVal = Math.log(num / den) / Math.log(1 + r);
        return nVal;
    }

    if (target === 'i') {
        // Newton-Raphson approximation for periodic rate r
        // Function f(r) = PV + PMT * (1+r*type) * ((1 - (1+r)^-n) / r) + FV * (1+r)^-n

        let rGuess = 0.05 / frequency; // Initial guess 5% annual
        if (n <= 0) return 0;

        for (let iter = 0; iter < 100; iter++) {
            let fValue, fDerivative;
            const factor = Math.pow(1 + rGuess, n);
            const factorInv = 1 / factor;

            if (Math.abs(rGuess) < 1e-8) {
                // Handle near zero case
                fValue = pv + pmt * n + fv;
                fDerivative = pmt * n * (n - 1) / 2 + fv * n;
            } else {
                const term1 = (1 + rGuess * type);
                const geometricSeries = (1 - factorInv) / rGuess;

                fValue = pv + pmt * term1 * geometricSeries + fv * factorInv;

                // Numerical derivative
                const delta = 1e-5;
                const r2 = rGuess + delta;
                const factor2 = Math.pow(1 + r2, n);
                const factorInv2 = 1 / factor2;
                const term1_2 = (1 + r2 * type);
                const geometricSeries2 = (1 - factorInv2) / r2;
                const fValue2 = pv + pmt * term1_2 * geometricSeries2 + fv * factorInv2;

                fDerivative = (fValue2 - fValue) / delta;
            }

            if (Math.abs(fDerivative) < 1e-9) break;

            const nextR = rGuess - fValue / fDerivative;
            // Converged
            if (Math.abs(nextR - rGuess) < 1e-8) {
                return nextR * frequency * 100; // Return Annual %
            }
            rGuess = nextR;
        }
        return rGuess * frequency * 100;
    }

    return 0;
};

export const calculateLoan = (amount, rate, termMonths, paymentsMade = 0) => {
    const r = rate / 100 / 12;
    const n = termMonths;

    // Monthly Payment Formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let payment = 0;
    if (r === 0) {
        payment = amount / n;
    } else {
        payment = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = payment * n;
    const totalInterest = totalPayment - amount;

    // Calculate Outstanding Balance
    // B = P * ((1+r)^n - (1+r)^p) / ((1+r)^n - 1)
    let balance = 0;
    if (paymentsMade < n) {
        if (r === 0) {
            balance = amount - (payment * paymentsMade);
        } else {
            const factorN = Math.pow(1 + r, n);
            const factorP = Math.pow(1 + r, paymentsMade);
            balance = amount * (factorN - factorP) / (factorN - 1);
        }
    }

    return {
        monthlyPayment: payment,
        totalPayment,
        totalInterest,
        outstandingBalance: Math.max(0, balance)
    };
};

export const calculateBond = (faceValue, couponRate, ytm, years, frequency = 1) => {
    const c = (couponRate / 100) * faceValue / frequency; // Coupon payment
    const r = (ytm / 100) / frequency; // Periodic yield
    const n = years * frequency; // Total periods

    // Bond Price = C * (1 - (1+r)^-n)/r + F * (1+r)^-n
    let price = 0;
    if (r === 0) {
        price = c * n + faceValue;
    } else {
        const factor = Math.pow(1 + r, -n);
        price = c * ((1 - factor) / r) + faceValue * factor;
    }
    return price;
};

export const calculateNPV = (rate, cashFlows) => {
    const r = rate / 100;
    return cashFlows.reduce((acc, flow, t) => {
        return acc + flow / Math.pow(1 + r, t);
    }, 0);
};

export const calculateIRR = (cashFlows, guess = 0.1) => {
    // Newton-Raphson for IRR
    // 0 = Sum(CFt / (1+r)^t)
    let r = guess;
    for (let i = 0; i < 100; i++) {
        let npv = 0;
        let dNpv = 0;
        for (let t = 0; t < cashFlows.length; t++) {
            const factor = Math.pow(1 + r, t);
            npv += cashFlows[t] / factor;
            dNpv -= t * cashFlows[t] / (Math.pow(1 + r, t + 1)); // Derivate wrt r: -t * CFt * (1+r)^-(t+1)
        }

        if (Math.abs(dNpv) < 1e-9) break;
        const newR = r - npv / dNpv;
        if (Math.abs(newR - r) < 1e-6) return newR * 100;
        r = newR;
    }
    return r * 100;
};

export const calculateEAR = (nominal, n) => {
    // EAR = (1 + r/n)^n - 1
    const r = nominal / 100;
    const val = Math.pow(1 + r / n, n) - 1;
    return val * 100;
};
