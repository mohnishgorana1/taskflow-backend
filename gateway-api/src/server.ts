import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Gateway API running on http://localhost:${PORT}`);
});
