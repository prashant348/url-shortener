import { describe, it, expect, vi } from "vitest";
import { Server } from "http";
import { ShutdownService } from "../../src/services/shutdown.service";
import { db } from "../../src/db/db";
import { NextFunction, Request, Response } from "express";
import { DatabaseService } from "../../src/services/database.service";
import { PrismaClient } from "../../src/generated/prisma/client";
// import { ENV } from "../../src/config/env";

describe("Shutdown Service Tests", () => {
    it("should call server.close, server.closeIdleConnections and process.exit with code 0 on graceful shutdown", async () => {

        const fakeServer = {
            close: vi.fn(),
            closeIdleConnections: vi.fn(),
        } as unknown as Server;

        const exitSpy = vi
            .spyOn(process, "exit")
            .mockImplementation(() => {
                throw new Error("process.exit called");
            });

        const disconnectSpy = vi
            .spyOn(db, "disconnect")
            .mockImplementation(async () => undefined);

        const ss = new ShutdownService();

        await expect(ss.gracefulShutdown("SIGINT", fakeServer)).rejects.toThrowError("process.exit called");

        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(disconnectSpy).toHaveBeenCalledWith("Shutdown gracefully!");
        expect(ss.isShuttingDown).toBe(true); // this is due to i did not write logic to reset the value to false just before process.exit

        expect(fakeServer.close).toHaveBeenCalled();
        expect(fakeServer.closeIdleConnections).toHaveBeenCalled();

        exitSpy.mockRestore();

    });

    it("should increment activeRequests and call next", () => {
        const ss = new ShutdownService();

        const req = {} as Request;

        const finishCallbacks: (() => void)[] = [];

        const res = {
            // typical .on() do this: takes event and a callback, and calls the callback as event emitted
            on: vi.fn((event, callback) => {
                if (event === "finish") {
                    finishCallbacks.push(callback);
                };
            }),
        } as unknown as Response;

        const next = vi.fn();

        ss.monitorRequests(req, res, next);

        finishCallbacks[0]();

        expect((ss as any)._activeRequests).toBe(0);
        expect(next).toHaveBeenCalled();
    });

    it("should return 503 if shutting down", () => {
        const ss = new ShutdownService();
        (ss as any)._isShuttingDown = true;

        const req = {} as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn();

        ss.monitorRequests(req, res, next);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(next).not.toHaveBeenCalled();
    });

    it("should drain all the requests and shutdown gracefully", async () => {

        const ss = new ShutdownService();

        const fakePrisma = {
            $connect: vi.fn().mockResolvedValue(undefined),
            $disconnect: vi.fn().mockResolvedValue(undefined),
            $queryRaw: vi.fn().mockResolvedValue(1),
        } as unknown as PrismaClient;

        const db = new DatabaseService(fakePrisma);

        // first connect to database
        await db.connect();

        // after successful connection expect db status to be "connected"
        expect(db.status).toBe("connected");

        const fakeServer = {
            close: vi.fn(),
            closeIdleConnections: vi.fn(),
        } as unknown as Server;

        const req = {} as Request;

        const finishCallbacks: (() => void)[] = [];

        const res = {
            on: vi.fn((event, callback) => {
                if (event === "finish") {
                    finishCallbacks.push(callback);
                };
            }),
            status: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const exitSpy = vi
            .spyOn(process, "exit")
            .mockImplementation(() => {
                return undefined as never;
            });

        ss.monitorRequests(req, res, next);

        // at this point activeRequests value should be 1
        expect((ss as any)._activeRequests).toBe(1);

        // now initiate gracful shutdown
        // problem with this is it get resolved immediately after registering process.once
        const shutdownPromise = ss.gracefulShutdown("SIGINT", fakeServer);

        expect(ss.isShuttingDown).toBe(true);

        expect(fakeServer.close).toHaveBeenCalled();

        expect(fakeServer.closeIdleConnections).toHaveBeenCalled();

        // gracefulShutdown resolves BEFORE cleanup actually finishes 
        await expect(shutdownPromise).resolves.toBeUndefined();

        finishCallbacks[0]();

        // this is happening - at this point, status: ok
        expect((ss as any)._activeRequests).toBe(0);

        // now db getting disconnected properly with cleanup message
        await expect(db.disconnect("Shutdown gracefully")).resolves.toBeUndefined();

        // this is also happening because logic of "if db is disconnedted so status will be changed" is written
        expect(db.status).toBe("disconnected");

        // this is also happening just after status change
        expect(exitSpy).toBeCalledWith(0);
        expect(exitSpy).toBeCalledTimes(1);

        exitSpy.mockRestore();
    });
});


// describe("n Active Requests + Graceful Shutdown + Monitor Requests + Force Exit + Send Request While Shutting Down", () => {

//     // DO NOT REMOVE THIS LINE
//     // this line is for handling test's event loop bug that arises due to force exiting
//     afterEach(() => {
//         process.removeAllListeners("CLEANUP_READY")
//     })

//     const main = async (
//         numberOfActiveRequestsToTestWith: number = 0,
//         testForceExit: boolean = false,
//         forceExitAfterHowManyCompletedRequests: number = 0,
//         sendRequestWhileShuttingDown: boolean = false,
//         sendRequestWhileShuttingDownAfterHowManyCompletedRequests: number = 0,
//     ) => {

//         if (numberOfActiveRequestsToTestWith < 0 || forceExitAfterHowManyCompletedRequests < 0 || sendRequestWhileShuttingDownAfterHowManyCompletedRequests < 0) {
//             throw new Error("numberOfActiveRequestsToTestWith and implementForceExitAfterHowManyCompletedRequests must be >= 0");
//         };

//         if (numberOfActiveRequestsToTestWith < forceExitAfterHowManyCompletedRequests) {
//             throw new Error("numberOfActiveRequestsToTestWith must be >= implementForceExitAfterHowManyCompletedRequests");
//         };

//         if (!testForceExit && forceExitAfterHowManyCompletedRequests) {
//             throw new Error("When testForceExit is false you should specify forceExitAfterHowManyCompletedRequests value as 0 always");
//         };

//         if (!sendRequestWhileShuttingDown && sendRequestWhileShuttingDownAfterHowManyCompletedRequests) {
//             throw new Error("When sendRequestWhileShuttingDown is false you should specify sendRequestWhileShuttingDownAfterHowManyCompletedRequests value as 0 always")
//         };

//         if (testForceExit && sendRequestWhileShuttingDown) {
//             if (sendRequestWhileShuttingDownAfterHowManyCompletedRequests > forceExitAfterHowManyCompletedRequests) {
//                 throw new Error("sendRequestWhileShuttingDownAfterHowManyCompletedRequests must be <= forceExitAfterHowManyCompletedRequests");
//             };
//         };

//         if (sendRequestWhileShuttingDown) {
//             if (sendRequestWhileShuttingDownAfterHowManyCompletedRequests > numberOfActiveRequestsToTestWith) {
//                 throw new Error("numberOfActiveRequestsToTestWith must be >= sendRequestWhileShuttingDownAfterHowManyCompletedRequests")
//             };
//         };

//         vi.useFakeTimers();

//         const ss = new ShutdownService();

//         const fakePrisma = {
//             $connect: vi.fn().mockResolvedValue(undefined),
//             $disconnect: vi.fn().mockResolvedValue(undefined),
//             $queryRaw: vi.fn().mockResolvedValue(1),
//         } as unknown as PrismaClient;

//         const db = new DatabaseService(fakePrisma);

//         // first connect to database
//         await db.connect();

//         // after successful connection expect db status to be "connected"
//         expect(db.status).toBe("connected");

//         const fakeServer = {
//             close: vi.fn(),
//             closeIdleConnections: vi.fn(),
//         } as unknown as Server;

//         const req = {} as Request;

//         const finishCallbacks: (() => void)[] = [];

//         const res = {
//             on: vi.fn((event, callback) => {
//                 if (event === "finish") {
//                     finishCallbacks.push(callback);
//                 };
//             }),
//             status: vi.fn().mockReturnThis(),
//             set: vi.fn().mockReturnThis(),
//             json: vi.fn(),
//         } as unknown as Response;

//         const next = vi.fn() as NextFunction;

//         const newReq = {} as Request;

//         const newRes = {
//             status: vi.fn().mockReturnThis(),
//             set: vi.fn().mockReturnThis(),
//             json: vi.fn(),
//         } as unknown as Response;

//         const newNext = vi.fn() as NextFunction;


//         const exitSpy = vi
//             .spyOn(process, "exit")
//             .mockImplementation(() => {
//                 return undefined as never;
//             });

//         // first of all call monitorRequests funtion - it is a sync function
//         // calling it activeRequests number of times
//         for (let i = 0; i <= (numberOfActiveRequestsToTestWith - 1); i++) {
//             ss.monitorRequests(req, res, next);
//         };

//         // at this point activeRequests value should be 1
//         expect((ss as any)._activeRequests).toBe(numberOfActiveRequestsToTestWith);

//         if (numberOfActiveRequestsToTestWith) {
//             expect(next).toHaveBeenCalled();
//         };

//         // now initiate gracful shutdown
//         // problem with this is it get resolved immediately after registering process.once
//         const shutdownPromise = ss.gracefulShutdown("SIGINT", fakeServer);

//         expect(ss.isShuttingDown).toBe(true);

//         expect(fakeServer.close).toHaveBeenCalled();

//         expect(fakeServer.closeIdleConnections).toHaveBeenCalled();

//         // gracefulShutdown resolves BEFORE cleanup actually finishes 
//         await expect(shutdownPromise).resolves.toBeUndefined();

//         // if taking force exit
//         if (testForceExit) {
//             // finish active requests only 'implementForceExitAfterHowManyCompletedRequests' times
//             for (let i = 0; i <= (numberOfActiveRequestsToTestWith - 1); i++) {
//                 if (sendRequestWhileShuttingDown && i === sendRequestWhileShuttingDownAfterHowManyCompletedRequests) {
//                     ss.monitorRequests(newReq, newRes, newNext)

//                     expect(newRes.status).toHaveBeenCalledWith(503);
//                     expect(newRes.set).toHaveBeenCalled();
//                     expect(newRes.json).toHaveBeenCalled();
//                     expect(newNext).not.toHaveBeenCalled();

//                 };
//                 if (i === forceExitAfterHowManyCompletedRequests) {
//                     break;
//                 };
//                 finishCallbacks[i]();
//                 expect(exitSpy).not.toBeCalled();
//             };

//             if (numberOfActiveRequestsToTestWith === forceExitAfterHowManyCompletedRequests) {

//                 expect((ss as any)._activeRequests).toBe(0);

//                 await expect(db.disconnect("Shutdown gracefully")).resolves.toBeUndefined();

//                 expect(db.status).toBe("disconnected");

//                 expect(exitSpy).toBeCalledWith(0);
//                 expect(exitSpy).toBeCalledTimes(1);

//                 exitSpy.mockRestore();
//                 return;
//             };

//             const timeout = ENV.FORCE_EXIT_TIMEOUT;
//             await vi.advanceTimersByTimeAsync(timeout * 1000);

//             expect(exitSpy).toBeCalledWith(1);
//             exitSpy.mockRestore();

//             vi.useRealTimers();

//             return;
//         }

//         // now at this point suppose active requests get completed:
//         // calling that finished sync callback function
//         // this line will emit an event through which performCleanup function will get invoked which is an async funtion
//         // also there is a line in performCleanup func -> process.exit(0) -> which will terminate the test so we will create a spy function for process.exit
//         for (let i = 0; i <= (numberOfActiveRequestsToTestWith - 1); i++) {
//             if (sendRequestWhileShuttingDown && i === sendRequestWhileShuttingDownAfterHowManyCompletedRequests) {
//                 ss.monitorRequests(newReq, newRes, newNext);

//                 expect(newRes.status).toHaveBeenCalledWith(503);
//                 expect(newRes.set).toHaveBeenCalled();
//                 expect(newRes.json).toHaveBeenCalled();
//                 expect(newNext).not.toHaveBeenCalled();

//             };
//             finishCallbacks[i]();
//         };

//         // this is happening - at this point, status: ok
//         expect((ss as any)._activeRequests).toBe(0);

//         // now db getting disconnected properly with cleanup message
//         await expect(db.disconnect("Shutdown gracefully")).resolves.toBeUndefined();

//         // this is also happening because logic of "if db is disconnedted so status will be changed" is written
//         expect(db.status).toBe("disconnected");

//         // this is also happening just after status change
//         expect(exitSpy).toBeCalledWith(0);
//         expect(exitSpy).toBeCalledTimes(1);

//         exitSpy.mockRestore();

//     }

//     it(`1. should shutdown gracefully with 0 active requests`, async () => await main());

//     it("2. should shutdown gracefully with 1 active requests", async () => await main(1));

//     it("3. should shutdown gracefully with 2 active requests", async () => await main(2));

//     it("4. should shutdown gracefully with 3 active requests", async () => await main(3));

//     it("5. should force exit before 3 active requests get completed while shutting down", async () => await main(3, true));

//     it("6. should force exit after 1 reqs get completed and 2 not completed while shutting down", async () => await main(3, true, 1));

//     it("7. should force exit after 2 reqs get completed and 1 not completed while shutting down", async () => await main(3, true, 2));

//     // rare case 
//     it("8. should gracefully shutdown after 3 reqs get completed", async () => await main(3, true, 3));

//     it("9. should gracefully shutdow and reject new incoming requests while shutting down", async () => await main(3, false, 0, true));

//     it("10. should gracefully shutdown and reject new incoming request after 1 req get completed while shutting down", async () => await main(3, false, 0, true, 1));

//     it("11. should gracefully shutdown and reject new incoming request after 2 req get completed while shutting down", async () => await main(3, false, 0, true, 2));

//     // rare case - new req sent after completing 3 req but before monitorRequests acts on it, graceful shutdown already happened so no log of rejection of new req
//     it("12. should gracefully shutdown and reject new incoming request after 3 req get completed while shutting down", async () => await main(3, false, 0, true, 3));

//     it("13. should force exit and reject new req before completing any req while shutting down", async () => await main(3, true, 0, true, 0));

//     // will throw error
//     // it("should force exit and reject new req after 1 req get completed while shutting down", async () => await main(3, true, 0, true, 1));

//     it("14. should force exit after 1 req get completed and reject new req before 3 req get completed while shutting down", async () => await main(3, true, 1, true, 0));

//     it("15. should force exit and reject new req after 1 req get completed while shutting down", async () => await main(3, true, 1, true, 1));

//     it("16. should force exit after 1 req get completed and reject new req after 0 req get completed while shutting down", async () => await main(3, true, 2, true, 0));

//     it("17. should force exit after 2 reqs get completed and reject new req after 1 req get completed while shutting down", async () => await main(3, true, 2, true, 1));

//     it("18. should force exit and reject new req after 2 req get completed while shutting down", async () => await main(3, true, 2, true, 2));

//     // rare case - new req sent after completing 3 req but before monitorRequests acts on it, graceful shutdown already happened so no log of rejection of new req
//     // same as case 12
//     it("19. should gracefully shutdown and reject new req after 3 req get completed while shutting down", async () => await main(3, true, 3, true, 3));

//     // WILL THROW ERROR
//     // it("error test",async () => await main(3, false, 0, true, 4))
// });