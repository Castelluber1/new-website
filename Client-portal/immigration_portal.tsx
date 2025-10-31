import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, FileText, User, LogOut, Calendar, Mail, Phone } from 'lucide-react';

// Simulação de banco de dados de clientes
const clientDatabase = {
  'joao.silva': {
    password: 'senha123',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '+55 11 98765-4321',
    processo: 'Visto de Trabalho - Canadá',
    status: 'em_progresso',
    etapa: 'Análise de Documentos',
    progresso: 60,
    dataInicio: '15/08/2024',
    previsaoConclusao: '15/12/2024',
    documentos: [
      { nome: 'Passaporte', status: 'aprovado' },
      { nome: 'Certidão de Nascimento', status: 'aprovado' },
      { nome: 'Comprovante de Residência', status: 'pendente' },
      { nome: 'Carta de Emprego', status: 'em_analise' }
    ],
    historico: [
      { data: '15/08/2024', evento: 'Processo iniciado' },
      { data: '22/08/2024', evento: 'Documentos iniciais recebidos' },
      { data: '10/09/2024', evento: 'Passaporte aprovado' },
      { data: '25/09/2024', evento: 'Aguardando comprovante de residência' }
    ],
    proximosPassos: [
      'Enviar comprovante de residência atualizado',
      'Agendar entrevista no consulado',
      'Realizar exames médicos'
    ]
  },
  'maria.santos': {
    password: 'senha456',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '+55 21 91234-5678',
    processo: 'Residência Permanente - Portugal',
    status: 'concluido',
    etapa: 'Aprovado',
    progresso: 100,
    dataInicio: '10/05/2024',
    previsaoConclusao: '10/10/2024',
    documentos: [
      { nome: 'Passaporte', status: 'aprovado' },
      { nome: 'Certidão de Casamento', status: 'aprovado' },
      { nome: 'Antecedentes Criminais', status: 'aprovado' },
      { nome: 'Comprovante Financeiro', status: 'aprovado' }
    ],
    historico: [
      { data: '10/05/2024', evento: 'Processo iniciado' },
      { data: '20/06/2024', evento: 'Todos documentos aprovados' },
      { data: '15/08/2024', evento: 'Processo enviado ao consulado' },
      { data: '10/10/2024', evento: 'Residência aprovada!' }
    ],
    proximosPassos: [
      'Retirar cartão de residência no SEF',
      'Registrar endereço em Portugal'
    ]
  },
  'carlos.oliveira': {
    password: 'senha789',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    telefone: '+55 85 99876-5432',
    processo: 'Visto de Estudante - Austrália',
    status: 'pendente',
    etapa: 'Documentação Inicial',
    progresso: 25,
    dataInicio: '01/10/2024',
    previsaoConclusao: '01/03/2025',
    documentos: [
      { nome: 'Passaporte', status: 'aprovado' },
      { nome: 'Carta de Aceitação da Universidade', status: 'pendente' },
      { nome: 'Comprovante Financeiro', status: 'pendente' },
      { nome: 'Seguro Saúde', status: 'pendente' }
    ],
    historico: [
      { data: '01/10/2024', evento: 'Processo iniciado' },
      { data: '10/10/2024', evento: 'Passaporte recebido e aprovado' },
      { data: '20/10/2024', evento: 'Aguardando documentos adicionais' }
    ],
    proximosPassos: [
      'Enviar carta de aceitação da universidade',
      'Providenciar comprovante financeiro (mínimo AUD 21,041)',
      'Contratar seguro saúde internacional'
    ]
  }
};

export default function ImmigrationPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentClient, setCurrentClient] = useState(null);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const client = clientDatabase[username];
    
    if (!client) {
      setError('Usuário não encontrado');
      return;
    }

    if (client.password !== password) {
      setError('Senha incorreta');
      return;
    }

    setCurrentClient(client);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCurrentClient(null);
    setSelectedTab('overview');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'text-green-600 bg-green-50';
      case 'em_analise':
        return 'text-blue-600 bg-blue-50';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="w-5 h-5" />;
      case 'em_analise':
        return <Clock className="w-5 h-5" />;
      case 'pendente':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getProcessStatusColor = (status) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500';
      case 'em_progresso':
        return 'bg-blue-500';
      case 'pendente':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Portal de Imigração</h1>
            <p className="text-gray-600">Acesse sua conta para ver o status do seu processo</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Digite seu usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Digite sua senha"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Entrar
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-semibold mb-2">Contas de teste:</p>
            <p className="text-xs text-gray-500">joao.silva / senha123</p>
            <p className="text-xs text-gray-500">maria.santos / senha456</p>
            <p className="text-xs text-gray-500">carlos.oliveira / senha789</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, {currentClient.nome}</h1>
                <p className="text-sm text-gray-500">{currentClient.processo}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Status do Processo</h2>
              <p className="text-gray-600">{currentClient.etapa}</p>
            </div>
            <div className={`px-4 py-2 rounded-full ${getProcessStatusColor(currentClient.status)} text-white font-semibold`}>
              {currentClient.status === 'concluido' ? 'Concluído' :
               currentClient.status === 'em_progresso' ? 'Em Progresso' : 'Pendente'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{currentClient.progresso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProcessStatusColor(currentClient.status)} transition-all duration-500`}
                style={{ width: `${currentClient.progresso}%` }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Data de Início</p>
                <p className="font-semibold text-gray-900">{currentClient.dataInicio}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Previsão de Conclusão</p>
                <p className="font-semibold text-gray-900">{currentClient.previsaoConclusao}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  selectedTab === 'overview'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setSelectedTab('documents')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  selectedTab === 'documents'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Documentos
              </button>
              <button
                onClick={() => setSelectedTab('history')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  selectedTab === 'history'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Histórico
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Informações de Contato</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{currentClient.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{currentClient.telefone}</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Próximos Passos</h3>
                  <div className="space-y-3">
                    {currentClient.proximosPassos.map((passo, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{passo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'documents' && (
              <div className="space-y-3">
                {currentClient.documentos.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{doc.nome}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      <span className="text-sm font-semibold capitalize">
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'history' && (
              <div className="space-y-4">
                {currentClient.historico.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                      {index < currentClient.historico.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 my-1" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm text-gray-500 mb-1">{item.data}</p>
                      <p className="text-gray-900 font-medium">{item.evento}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}