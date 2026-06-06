/* eslint-disable */
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const url = import.meta.env.VITE_APP_API_BASE_URL

function Runner() {
  // Keeps track of the formatted pairs returned directly from the backend
  const [runnerData, setRunnerData] = useState([])

  useEffect(() => {
    async function getRunnerInfo() {
      try {
        const res = await axios.get(`${url}/api/users/runner`);
        // The endpoint directly returns: [ {thisYearStats}, {prevYearStats} ]
        setRunnerData(res.data);
      } catch (error) {
        console.error("Failed fetching live runner counters:", error);
      }
    }
    getRunnerInfo();
  }, []);

  console.log(runnerData)
  return (
    <div className="w-full bg-cyan-950 text-cyan-100 py-3 overflow-hidden border-y border-cyan-800 shadow-inner select-none">
      {/* Container holding the dual lists for seamless looping */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">

        {/* Track 1 */}
        <div className="flex items-center gap-16 px-8 whitespace-nowrap">
          <StatGroup title="This Year" data={runnerData?.[0]} highlight={true} />
          <StatGroup title="Last Year" data={runnerData?.[1]} highlight={false} />
        </div>

        {/* Track 2 (Exact duplicate for seamless looping illusion) */}
        <div className="flex items-center gap-16 px-8 whitespace-nowrap" aria-hidden="true">
          <StatGroup title="This Year" data={runnerData?.[0]} highlight={true} />
          <StatGroup title="Last Year" data={runnerData?.[1]} highlight={false} />
        </div>

      </div>
    </div>
  )
}

export default Runner


function StatGroup({ title, data, highlight }) {
  return (
    <div className={`flex items-center gap-6 text-sm font-medium rounded-md pr-2 ${highlight ? "ring-2 ring-cyan-500 bg-cyan-900/40"
      : "ring-1 ring-cyan-700/50 bg-cyan-950/20"}`}>
      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${highlight ? 'bg-cyan-500 text-cyan-950' : 'bg-cyan-800/60 text-cyan-300 border border-cyan-700/50'
        }`}>
        {title}
      </span>

      <div className="flex items-center gap-2 *:leading-none">
        <span className="text-cyan-400 font-semibold ">Certificates Issued:</span>
        <span className={`${(data?.certificateIssued !== undefined && data?.certificateIssued !== null) ? "text-white font-bold tabular-nums" : "animate-pulse"}`}>
          {data?.certificateIssued ?? 0}
        </span>
      </div>

      <div className="flex items-center gap-2 *:leading-none">
        <span className="text-cyan-400 font-semibold">Users Joined:</span>
        <span className={`${(data?.usersJoined !== undefined && data?.usersJoined !== null) ? "text-white font-bold tabular-nums" : "animate-pulse"}`}>{data?.usersJoined ?? 0}</span>
      </div>

      <div className="flex items-center gap-2 *:leading-none">
        <span className="text-cyan-400 font-semibold">Videos submitted:</span>
        <span className={`${(data?.videoUploaded !== undefined && data?.videoUploaded !== null) ? "text-white font-bold tabular-nums" : "animate-pulse"}`}>{data?.videoUploaded ?? 0}</span>
      </div>

      <div className="flex items-center gap-2 *:leading-none">
        <span className="text-cyan-400 font-semibold">Images submitted:</span>
        <span className={`${(data?.imageUploaded !== undefined && data?.imageUploaded !== null) ? "text-white font-bold tabular-nums" : "animate-pulse"}`}>{data?.imageUploaded ?? 0}</span>
      </div>
    </div>
  );
}