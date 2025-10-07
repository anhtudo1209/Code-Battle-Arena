import { useState } from "react";
import axios from "axios";

export default function Battle() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;
int main() {
    int n; cin >> n;
    cout << n * 2 << endl;
    return 0;
}`);

  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const res = await axios.post("http://localhost:3000/api/submit", { code });
    setResult(res.data.result);
  };

  return (
    <div>
      <h1>Code Battle (C++)</h1>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={12}
        cols={70}
      />
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>Result: {result}</p>
    </div>
  );
}
