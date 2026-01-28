// calculator.js - Módulo da calculadora

export class Calculator {
    constructor() {
        this.expression = '0';
        this.display = document.getElementById("calcDisplay");
        
        if (this.display) {
            this.display.textContent = this.expression;
        }
    }

    // Parser matemático seguro (substitui o eval perigoso)
    static safeEval(expr) {
        expr = expr.replace('×', '*').replace(/\s+/g, '');
        
        // Permitir apenas números, operadores e parênteses
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
            throw new Error('Expressão inválida');
        }
        
        // Usar Function como alternativa mais segura ao eval
        try {
            return Function('"use strict"; return (' + expr + ')')();
        } catch (e) {
            throw new Error('Erro na expressão');
        }
    }

    append(value) {
        if (this.expression === '0' && !'+-*/.'.includes(value)) {
            this.expression = value;
        } else {
            this.expression += value;
        }
        this.updateDisplay();
    }

    clear() {
        this.expression = '0';
        this.updateDisplay();
    }

    backspace() {
        this.expression = this.expression.slice(0, -1);
        if (this.expression === '') this.expression = '0';
        this.updateDisplay();
    }

    calculate() {
        try {
            const result = Calculator.safeEval(this.expression);
            this.expression = result.toString();
            this.updateDisplay();
            
            // Efeito visual
            if (this.display) {
                this.display.style.textShadow = '0 0 15px rgba(0, 255, 170, 0.8)';
                setTimeout(() => {
                    this.display.style.textShadow = '0 0 8px rgba(0, 255, 170, 0.5)';
                }, 300);
            }
        } catch (error) {
            this.displayError();
        }
    }

    updateDisplay() {
        if (this.display) {
            this.display.textContent = this.expression;
        }
    }

    displayError() {
        if (this.display) {
            this.display.textContent = 'Erro';
            this.expression = '0';
            setTimeout(() => {
                this.display.textContent = this.expression;
            }, 1000);
        }
    }
}