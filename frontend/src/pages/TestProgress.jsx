import { useState } from "react";
import { CircularProgress, LinearProgress } from "../components/Progress";

const TestProgress = () => {
  const [showLoading, setShowLoading] = useState(false);

  const testLoading = () => {
    console.log("🧪 Starting loading test");
    setShowLoading(true);
    setTimeout(() => {
      console.log("🧪 Stopping loading test");
      setShowLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-light-surface dark:bg-dark-surface p-8">
      <h1 className="text-3xl font-bold mb-8 text-light-onSurface dark:text-dark-onSurface">
        Test Progress Components
      </h1>

      <div className="space-y-8">
        {/* Test CircularProgress */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface dark:text-dark-onSurface">
            CircularProgress - Small
          </h2>
          <div className="flex gap-4 items-center">
            <CircularProgress size="small" />
            <span className="text-light-onSurface dark:text-dark-onSurface">
              Small spinner
            </span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface dark:text-dark-onSurface">
            CircularProgress - Default
          </h2>
          <div className="flex gap-4 items-center">
            <CircularProgress />
            <span className="text-light-onSurface dark:text-dark-onSurface">
              Default spinner
            </span>
          </div>
        </div>

        {/* Test LinearProgress */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface dark:text-dark-onSurface">
            LinearProgress
          </h2>
          <LinearProgress />
        </div>

        {/* Test with button */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface dark:text-dark-onSurface">
            Test Button with Loading
          </h2>
          <button
            onClick={testLoading}
            disabled={showLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 flex items-center gap-2"
          >
            {showLoading ? (
              <>
                <CircularProgress size="small" />
                <span>Loading...</span>
              </>
            ) : (
              "Click to Test"
            )}
          </button>
        </div>

        {/* Inspect element */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface dark:text-dark-onSurface">
            Raw HTML Check
          </h2>
          <div className="space-y-2">
            <div className="circular-progress small" style={{ border: '3px solid red' }}>
              Raw circular-progress small
            </div>
            <div className="circular-progress" style={{ border: '4px solid blue' }}>
              Raw circular-progress default
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProgress;
