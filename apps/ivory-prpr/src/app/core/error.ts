

export class IvoryError implements Error {
    public get name() {
        return `SagitError<${this.code}>`;
    }
    public get message() {
        return this.descrption;
    }
    public toString() {
        return `${this.name} ${this.descrption}`;
    }
    constructor(public code: number, public descrption: string, public innerError?: Error) { }
}

export class IvoryUnauthorizedError extends IvoryError {
    constructor(message?: string) {
        super(-401, message || 'Unauthorize');
    }
}

export class IvoryAssertationError extends IvoryError {
    constructor(message?: string) {
        super(-997, message || 'An assertation has been rejected.', undefined);
    }
}

export function assert(condition: boolean, message?: string) {
    if (!condition) {
        throw new IvoryAssertationError(message);
    }
}
