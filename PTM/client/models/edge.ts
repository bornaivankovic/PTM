import { FailRepairRate } from './rates';

export class Edge extends FailRepairRate {
    private label: string;
    private id: string;
    private from: string;
    private to: string;


    /* Getters and setters */

    getLabel(): string {
        return this.label;
    }

    setLabel(label: string): void {
        this.label = label;
    }

    getId(): string {
        return this.id;
    }

    setId(id: string): void {
        this.id = id;
    }

    getFrom(): string {
        return this.from;
    }

    setFrom(from: string): void {
        this.from = from;
    }

    getTo(): string {
        return this.to;
    }

    setTo(to: string): void {
        this.to = to;
    }
}