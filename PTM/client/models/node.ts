export class Node  {
    private label: string;
    private id: string;

    constructor() { }

    getName(): string {
        return this.label;
    }

    setName(name: string): void {
        this.label = name;
    }

    getId(): string {
        return this.id;
    }

    setId(id: string): void {
        this.id = id;
    }
    
}