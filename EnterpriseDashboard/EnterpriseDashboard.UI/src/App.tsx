import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Products } from './pages/Products';
import { Suppliers } from './pages/Suppliers';
import { Locations } from './pages/Locations';
import { TimeIntelligence } from './pages/TimeIntelligence';
import { Delivery } from './pages/Delivery';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="locations" element={<Locations />} />
              <Route path="time" element={<TimeIntelligence />} />
              <Route path="delivery" element={<Delivery />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
