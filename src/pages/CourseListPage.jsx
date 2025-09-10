import React, { useState, useMemo } from 'react';
import { useApiData } from '../hooks/useApiData';
import { Card } from '../components/ui/Card';
import { FiBookOpen, FiSearch } from 'react-icons/fi'; // Importa o ícone de busca

export const CourseListPage = () => {
  const { data: courses, loading, error } = useApiData('/courses');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para armazenar o termo da busca

  // Filtra os cursos com base no termo de busca.
  // useMemo garante que o filtro só seja re-executado quando a lista de cursos ou o termo de busca mudarem.
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex items-center">
          <FiBookOpen size={32} className="text-dashboard-blue-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-dark dark:text-dark-text-primary">
            Catálogo de Cursos
          </h1>
        </div>
        <p className="text-slate-600 dark:text-dark-text-secondary mt-1">
          Lista de todos os cursos únicos encontrados na plataforma após normalização.
        </p>
      </header>

      {/* --- INÍCIO: Barra de Busca --- */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <FiSearch className="text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Buscar curso por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 border border-gray-medium rounded-lg bg-white dark:bg-dark-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-dashboard-blue-primary"
        />
      </div>
      {/* --- FIM: Barra de Busca --- */}
      
      <main className="mt-2">
        <Card className="p-0">
          {loading && <p className="p-6">Carregando cursos...</p>}
          {error && <p className="p-6 text-red-500">Erro ao carregar: {error.message}</p>}
          
          {/* --- ATUALIZAÇÃO: Renderiza a lista filtrada --- */}
          {!loading && !error && filteredCourses.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto">
              <ul className="divide-y divide-gray-medium dark:divide-dark-border">
                {filteredCourses.map(course => (
                  <li key={course.id} className="py-3 px-6 hover:bg-gray-light dark:hover:bg-dark-bg">
                    <span className="text-sm text-gray-dark dark:text-dark-text-primary">{course.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="p-6 text-slate-500 dark:text-dark-text-secondary">
              {!loading && (searchTerm ? `Nenhum curso encontrado para "${searchTerm}"` : 'Nenhum curso encontrado.')}
            </p>
          )}
        </Card>
      </main>
    </div>
  );
};