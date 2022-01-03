import './App.css';
import Canvas from './components/Canvas';

function App() {
  return (
    <div className="App">
      <Canvas id="canvas" width={900} height={600} />
    </div>
  );
}

export default App;
