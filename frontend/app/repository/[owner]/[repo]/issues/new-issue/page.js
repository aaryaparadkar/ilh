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
  let repoId;
  const [ethPrize, setEthPrize] = useState(0.1)
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)

  const checkDuplicateIssue = async () => {
    try {
      const LStoken = localStorage.getItem("githubAccessToken")
      if (!LStoken) {
        setError("GitHub access token not found.")
        return false
      }

      const response = await fetch(
        `https://muj-gitstakeai.onrender.com/api/avoidDUp/${owner}/${repo}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LStoken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: title,
            body: description
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.message.includes("Similar")
      }
      return false
    } catch (error) {
      console.error("Error checking for duplicates:", error)
      return false
    }
  }

  const handleCreateIssue = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First check for duplicates
      const isDuplicateIssue = await checkDuplicateIssue()
      if (isDuplicateIssue) {
        setIsDuplicate(true)
        setError("A similar issue already exists. Please check existing issues.")
        setLoading(false)
        return
      }

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
            body: description,
            labels: tags.split(",").map((tag) => tag.trim()),
          }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        setIssueId(data?.number)
        try {
          console.log("creatingIssue...", token, account, data?.number, repoId)
          if (token && account) {
            const tx = await stakingContract.createIssue(repoId, data?.number, (ethers.parseEther(ethPrize.toString())));
            await tx.wait(2);
          }
        }
        catch (error) {
          console.log("create issue:", error)
        }
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

  // Check for duplicates when title or description changes
  const handleInputChange = async (field, value) => {
    if (field === 'title') setTitle(value)
    if (field === 'description') setDescription(value)

    // Only check for duplicates if both title and description have content
    if (title.trim() && description.trim()) {
      const isDuplicateIssue = await checkDuplicateIssue()
      setIsDuplicate(isDuplicateIssue)
      if (isDuplicateIssue) {
        setError("A similar issue already exists. Please check existing issues.")
      } else {
        setError(null)
      }
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
            onChange={(e) => handleInputChange('title', e.target.value)}
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
            onChange={(e) => handleInputChange('description', e.target.value)}
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
            disabled={loading || isDuplicate}
            style={{ width: 200 }}
          >
            {loading ? "Creating..." : "Create New Issue"}
          </button>
        </div>
      </div>
    </>
  )
}