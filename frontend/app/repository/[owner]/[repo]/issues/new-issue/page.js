"use client"
import { useParams, useRouter } from "next/navigation"
import { useContext, useState } from "react"
import styles from "../../../../../styles.module.css"
import Web3Context from "@/context/Web3Context";
import { ethers } from "ethers";

export default function NewIssue() {
  const { provider, account, stakingContract, token, chainId } = useContext(Web3Context)
  const router = useRouter()
  const { owner, repo } = useParams()

  const [issueId, setIssueId] = useState()
  //const [repoId, setRepoId] = useState()
  let repoId;
  const [ethPrize, setEthPrize] = useState(0.1) // Default value 0.1 ETH
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCreateIssue = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const LStoken = localStorage.getItem("githubAccessToken")
      if (!LStoken) {
        setError("GitHub access token not found.")
        setLoading(false)
        return
      }
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `token ${LStoken}`,
        },
      })
      if (repoResponse.ok) {
        const repoData = await repoResponse.json()
        repoId = repoData?.id
        console.log(repoId)
      } else {
        console.error("Failed to fetch repo info:", repoResponse.statusText)
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${LStoken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            body: description, // Only the description is included in the body
            labels: tags.split(",").map((tag) => tag.trim()), // Split tags into array and add as labels
          }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        console.log("Issue created:", data?.number)
        console.log("Issue created:", data)
        setIssueId(data?.number)
        try {
          // stakingContract.on("IssueCreated", (repoId, issueId, creator, prize) => {
          //   console.log(`Issue ${issueId.toString()} Created on Repo ${repoId.toString()}!`);
          //   console.log(`Staker: ${creator}`);
          //   console.log(`Prize: ${ethers.formatEther(prize)} GST`);
          // });
          console.log("creatingIssue...", token, account, data?.number, repoId)
          if (token && account) {
            const tx = await stakingContract.createIssue(repoId, data?.number, (ethers.parseEther(ethPrize.toString())));
            await tx.wait(2);
          }
        }
        catch (error) {
          console.log("create issue:", error)
        }
        // You can handle the ETH prize separately here if needed
        router.push(`/repository/${owner}/${repo}/issues`)
      } else {
        setError("Failed to create issue.")
        console.error("Failed to create issue:", response.statusText)
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error("Error creating issue:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          padding: "30px 20%",
          gap: 30,
        }}
      >
        <div>
          Set Win Prize (minimum 0.1 ETH) <br />
          <input
            type="number"
            placeholder="ETH Prize"
            value={ethPrize}
            onChange={(e) => setEthPrize(parseFloat(e.target.value))}
            min="0.1"
            step="0.1"
            style={{
              color: "var(--font)",
              padding: "0 5px",
              width: "750px",
              height: "30px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          Add Title
          <br />
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              color: "var(--font)",
              padding: "0 5px",
              width: "750px",
              height: "30px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>

        <div>
          Add Tags (comma separated)
          <br />
          <input
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              color: "var(--font)",
              padding: "0 5px",
              width: "750px",
              height: "30px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>

        <div>
          Add Description
          <br />
          <textarea
            placeholder="Add your description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              minHeight: 150,
              color: "var(--font)",
              padding: "5px",
              width: "750px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <button
            className={styles.ForkButton}
            onClick={handleCreateIssue}
            disabled={loading}
            style={{ width: 200 }}
          >
            {loading ? "Creating..." : "Create New Issue"}
          </button>
        </div>
      </div>
    </>
  )
}

// <table>
//     <thead>
//     19 open issues
//     </thead>
// </table>