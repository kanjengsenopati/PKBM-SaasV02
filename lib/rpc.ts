export async function callRpc(module: string, functionName: string, args: any[] = []) {
  try {
    const response = await fetch('/api/rpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ module, functionName, args }),
    });
    
    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('RPC Error:', error);
    throw error;
  }
}
