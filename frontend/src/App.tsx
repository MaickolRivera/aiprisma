import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import { NewsExplorer } from "@/sections/NewsExplorer";
import { ScrollStory } from "@/sections/ScrollStory";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <ScrollStory />
        <NewsExplorer />
      </main>
      <Footer />
    </>
  );
}
