import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Upload réussi !");
        fetchFiles(); // Actualiser la liste après upload
      } else {
        setMessage("❌ " + result.error);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur côté client");
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/list");
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur lors de la récupération des fichiers");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Uploader une image vers S3</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Uploader</button>
      </form>
      <p>{message}</p>

      <hr />

      <h2>Liste des fichiers dans le bucket</h2>
      <button onClick={fetchFiles}>Afficher la liste des fichiers</button>
    <ul>
      {files.map((file) => (
        <li key={file}>
          {file}{" "}
          <button onClick={() => handleDelete(file)} style={{ color: "red" }}>
          Supprimer
          </button>
      </li>
      ))}
    </ul>

    </div>
  );
}
const handleDelete = async (fileName) => {
  try {
    const res = await fetch(`/api/delete?file=${encodeURIComponent(fileName)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage(`🗑️ Fichier "${fileName}" supprimé avec succès !`);
      fetchFiles(); // Actualise la liste après suppression
    } else {
      const data = await res.json();
      setMessage(`❌ Erreur : ${data.error}`);
    }
  } catch (error) {
    console.error(error);
    setMessage("❌ Erreur lors de la suppression");
  }
};
