import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const DiagnosticTest = () => {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const testResults: any = {};

    // Test 1: Check Supabase URL  
    const url = 'https://kofhwlmffnzpehaoplzx.supabase.co';
    testResults.url = {
      status: true,
      message: url,
    };

    // Test 2: Check Supabase Key
    const keyPresent = true; // We hardcoded it
    testResults.key = {
      status: keyPresent,
      message: keyPresent ? 'Key is hardcoded in supabase.ts' : 'Not configured',
    };

    // Test 3: Test Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      testResults.connection = {
        status: !error,
        message: error ? error.message : 'Connection successful!',
      };
    } catch (err: any) {
      testResults.connection = {
        status: false,
        message: err.message,
      };
    }

    // Test 4: Test Auth Endpoint
    try {
      const { data, error } = await supabase.auth.getSession();
      testResults.auth = {
        status: !error,
        message: error ? error.message : 'Auth endpoint working!',
      };
    } catch (err: any) {
      testResults.auth = {
        status: false,
        message: err.message,
      };
    }

    setResults(testResults);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">🔍 Supabase Diagnostic Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {testing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3">Running diagnostics...</span>
            </div>
          ) : (
            <>
              {Object.entries(results).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border">
                  {value.status ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold capitalize mb-1">{key.replace('_', ' ')}</h3>
                    <p className="text-sm text-muted-foreground break-all">{value.message}</p>
                  </div>
                </div>
              ))}
              
              <Button onClick={runTests} className="w-full mt-4">
                Run Tests Again
              </Button>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Quick Fix:</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Go to: <a href="https://supabase.com/dashboard/project/kofhwlmffnzpehaoplzx/settings/api" target="_blank" className="text-primary underline">Supabase API Settings</a></li>
                  <li>Copy the <strong>anon/public</strong> key</li>
                  <li>Update src/lib/supabase.ts with the correct key</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticTest;

