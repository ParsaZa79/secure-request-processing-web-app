/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import toast, { Toaster } from "react-hot-toast";
import { Spinner } from "@nextui-org/react";

import { UserDropdown } from "../components/user-dropdown";
import { useAppStore } from "../store";
import { ProtectedRoute } from "../components/protected-route";


interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-[600px]">
      <div className="mb-4">
        <Button onClick={() => setIsFlipped(!isFlipped)}>
          {isFlipped ? "Show Logs" : "Show Requests"}
        </Button>
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isFlipped ? "back" : "front"}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: 180, opacity: 0 }}
          initial={{ rotateY: isFlipped ? -180 : 0, opacity: 0 }}
          style={{
            backfaceVisibility: "hidden",
            width: "100%",
            height: "100%",
            position: "absolute"
          }}
          transition={{ duration: 0.6 }}
        >
          {isFlipped ? back : front}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function DashboardContent() {
  const [query, setQuery] = useState("");

  const {
    submitRequest,
    getResult,
    currentResult,
    fetchLogs,
    logs,
    isLoading,
    error,
    setError,
    userRequests,
    fetchUserRequests,
  } = useAppStore();

  const [showLogs, setShowLogs] = useState(true);

  const handleSubmit = async () => {
    try {
      const requestId = await submitRequest(query);

      if (requestId !== -1) {
        await getResult(requestId);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const handleRetry = async () => {
    if (currentResult && currentResult.request_id) {
      try {
        await getResult(currentResult.request_id);
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("An unknown error occurred while retrying");
        }
      }
    } else {
      toast.error("No current result to retry");
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  useEffect(() => {
    fetchLogs();
    fetchUserRequests();
  }, [fetchLogs, fetchUserRequests]);

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserDropdown />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">Submit Request</h3>
        </CardHeader>
        <CardBody>
          <Input
            className="mb-2"
            placeholder="Enter your query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button color="primary" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <>
                <Spinner color="white" size="sm" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </CardBody>
      </Card>

      {currentResult && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-4 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0" />
            <CardHeader className="relative z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Result</h3>
              <Button
                isIconOnly
                aria-label="Retry"
                color="primary"
                disabled={isLoading}
                onClick={handleRetry}
              >
                <ArrowPathIcon className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardBody className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                {currentResult.status === "completed" ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-400" />
                )}
                <p className="text-lg font-light text-white">
                  Status: {currentResult.status.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <EyeIcon className="w-6 h-6 text-white" />
                <p className="text-lg font-light text-white text-opacity-90">
                  Result: {currentResult.result ?? "No result available"}
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      <Card className="w-full h-[600px] overflow-hidden">
        <CardHeader className="flex justify-between items-center">
          <div className="flex">
            <Button
              color={showLogs ? "primary" : "default"}
              onClick={() => setShowLogs(true)}
              className="rounded-r-none"
            >
              Logs
            </Button>
            <Button
              color={!showLogs ? "primary" : "default"}
              onClick={() => setShowLogs(false)}
              className="rounded-l-none"
            >
              Requests
            </Button>
          </div>
          <Button onClick={showLogs ? fetchLogs : fetchUserRequests}>
            Fetch {showLogs ? "Logs" : "Requests"}
          </Button>
        </CardHeader>
        <CardBody>
          <AnimatePresence mode="wait">
            <motion.div
              key={showLogs ? "logs" : "requests"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showLogs ? (logs.length > 0 ? (
                <Table aria-label="Logs table">
                  <TableHeader>
                    <TableColumn>Timestamp</TableColumn>
                    <TableColumn>Level</TableColumn>
                    <TableColumn>Module</TableColumn>
                    <TableColumn>Message</TableColumn>
                    <TableColumn>URL</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}
                          >
                            {log.level}
                          </span>
                        </TableCell>
                        <TableCell>{log.module}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{log.url}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>
                  No logs available. Click 'Fetch Logs' to retrieve the latest
                  logs.
                </p>
              )
              ) : userRequests.length > 0 ? (
                <Table aria-label="User Requests table">
                  <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Query</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Result</TableColumn>
                    <TableColumn>Created At</TableColumn>
                    <TableColumn>Updated At</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {userRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.id}</TableCell>
                        <TableCell>{request.user_query}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${request.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell>{request.result}</TableCell>
                        <TableCell>
                          {format(
                            new Date(request.created_at),
                            "yyyy-MM-dd HH:mm:ss",
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(request.updated_at),
                            "yyyy-MM-dd HH:mm:ss",
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>
                  No user requests available. Click 'Fetch Requests' to retrieve the
                  latest requests.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </CardBody>
      </Card>
    </div>
  );
}

function getLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case "error":
      return "bg-red-100 text-red-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "info":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
