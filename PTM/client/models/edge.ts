import { FailRepairRate } from './rates';

export class Edge extends FailRepairRate {
    
    /*visualization*/
    private label: string;
    private id: string;
    private from: string;
    private to: string;
    private length: number;

    /*backend parameters*/
    private src: string;
    private dest: string;
    
    constructor(label:string, id:string, from:string, to:string){
        super();
        this.label = label;
        this.id = id;
        this.from = from;
        this.to = to;
    }


    /* Getters and setters */

    getSrc(): string {
        return this.src;
    }

    setSrc(src: string): void {
        this.src = src;
    }

    getDest(): string {
        return this.dest;
    }

    setDest(dest: string): void {
        this.dest = dest;
    }

    getLength(): number {
        return this.length;
    }

    setLength(length: number): void {
        this.length = length;
    }


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