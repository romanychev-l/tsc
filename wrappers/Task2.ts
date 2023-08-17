import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleReader, TupleItem, TupleBuilder } from 'ton-core';

export type Task2Config = {};

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell().endCell();
}

export class Task2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task2(address);
    }

    static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
        const data = task2ConfigToCell(config);
        const init = { code, data };
        return new Task2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getMatrixMultiplier(provider: ContractProvider, matrixA: number[][], matrixB: number[][]): Promise<TupleReader> {

        const mA = new TupleBuilder();
        const mB = new TupleBuilder();

        const r0 = new TupleBuilder();
        for (let i = 0; i < matrixA.length; i++) {
            const row = new TupleBuilder();
            for(let j = 0; j < matrixA[i].length; j++) {
                row.writeNumber(matrixA[i][j])
            }
            const r0 = row.build();
            mA.writeTuple(r0);
        }
        const mAb = mA.build();

        const r1 = new TupleBuilder();
        for (let i = 0; i < matrixB.length; i++) {
            const row = new TupleBuilder();
            for(let j = 0; j < matrixB[i].length; j++) {
                row.writeNumber(matrixB[i][j])
            }
            const r1 = row.build();
            mB.writeTuple(r1);
        }
        const mBb = mB.build();

        const res = await provider.get('matrix_multiplier', [{type: 'tuple', items: mAb}, {type: 'tuple', items: mBb}]);
        const tuple  = res.stack.readTuple();
        return tuple;
    }
}
