"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";

import { useAppStore } from "../store";
import { useAuth } from "../hooks/useAuth";
import { ProtectedRoute } from "../components/protected-route";

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
  } = useAppStore();
  const { logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    const requestId = await submitRequest(query);

    if (requestId !== -1) {
      await getResult(requestId);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button color="danger" onClick={handleLogout}>
          Logout
        </Button>
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
          <Button onClick={handleSubmit}>Submit</Button>
        </CardBody>
      </Card>

      {currentResult && (
        <Card className="mb-4">
          <CardHeader>
            <h3 className="text-lg font-semibold">Result</h3>
          </CardHeader>
          <CardBody>
            <p>Status: {currentResult.status}</p>
            <p>Result: {currentResult.result}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Logs</h3>
        </CardHeader>
        <CardBody>
          <Button className="mb-2" onClick={fetchLogs}>
            Fetch Logs
          </Button>
          {logs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </CardBody>
      </Card>

      {isLoading && <p className="mt-4">Loading...</p>}
      {error && (
        <Card isBlurred className="mt-4">
          <CardBody>
            <p className="text-danger">{error}</p>
            <Button className="mt-2" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
