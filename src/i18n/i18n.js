import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        investments: 'Investments',
        copyTrading: 'Copy Trading',
        deposit: 'Deposit',
        withdrawal: 'Withdrawal',
        transactions: 'Transactions',
        profile: 'Profile',
        connectWallet: 'Connect Wallet',
        disconnect: 'Disconnect'
      },
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Welcome to your investment dashboard',
        totalBalance: 'Total Balance',
        allTime: 'All time',
        totalProfit: 'Total Profit',
        lifetimeEarnings: 'Lifetime earnings',
        invested: 'Invested',
        active: 'active',
        available: 'Available',
        readyToInvest: 'Ready to invest',
        quickActions: 'Quick Actions',
        makeDeposit: 'Make Deposit',
        requestWithdrawal: 'Request Withdrawal',
        viewInvestments: 'View Investments',
        exploreCopyTrading: 'Explore Copy Trading',
        activePortfolio: 'Active Portfolio',
        asset: 'Asset',
        amount: 'Amount',
        value: 'Value',
        recentTransactions: 'Recent Transactions',
        type: 'Type',
        status: 'Status',
        date: 'Date',
        noAssets: 'No assets in portfolio',
        noTransactions: 'No recent transactions',
        loading: 'Loading...'
      },
      // Investments
      investments: {
        title: 'Investment Plans',
        subtitle: 'Choose the perfect plan for your investment goals',
        roi: 'ROI',
        duration: 'Duration',
        days: 'days',
        minInvestment: 'Min Investment',
        maxInvestment: 'Max Investment',
        profitInterval: 'Profit Interval',
        investNow: 'Invest Now',
        investIn: 'Invest in',
        enterAmount: 'Enter Amount',
        yourBalance: 'Your Balance',
        investmentAmount: 'Investment Amount',
        expectedROI: 'Expected ROI',
        minExpectedReturn: 'Min Expected Return',
        maxExpectedReturn: 'Max Expected Return',
        cancel: 'Cancel',
        confirmInvestment: 'Confirm Investment',
        loading: 'Loading plans...',
        noPlans: 'No investment plans available'
      },
      // Copy Trading
      copyTrading: {
        title: 'Copy Trading',
        subtitle: 'Follow expert traders and copy their trades automatically',
        expertise: 'Expertise',
        winRate: 'Win Rate',
        totalROI: 'Total ROI',
        followers: 'Followers',
        minAmount: 'Min Amount',
        verified: 'Verified',
        copyNow: 'Copy Now',
        startCopying: 'Start Copying',
        enterAmount: 'Enter Amount to Copy',
        minCopyAmount: 'Minimum copy trade amount is $100',
        yourBalance: 'Your Balance',
        copyAmount: 'Copy Amount',
        traderROI: 'Trader ROI',
        expectedReturn: 'Expected Return',
        cancel: 'Cancel',
        confirmCopy: 'Confirm Copy Trade',
        loading: 'Loading traders...',
        noTraders: 'No copy traders available'
      },
      // Deposit
      deposit: {
        title: 'Deposit Funds',
        selectCrypto: 'Select Cryptocurrency',
        selectNetwork: 'Select Network',
        enterAmount: 'Enter Amount',
        depositAddress: 'Deposit Address',
        copyAddress: 'Copy Address',
        addressCopied: 'Address copied!',
        important: 'Important',
        warning: 'Only send {{crypto}} on {{network}} network to this address. Sending other assets or using different networks may result in permanent loss.',
        minDeposit: 'Minimum deposit is 10',
        confirmDeposit: 'Confirm Deposit',
        depositSuccess: 'Deposit request submitted! Your {{amount}} {{crypto}} deposit is pending approval. Funds will be credited after admin confirmation.',
        depositError: 'Failed to create deposit request. Please try again.'
      },
      // Withdrawal
      withdrawal: {
        title: 'Withdraw Funds',
        availableBalance: 'Available Balance',
        selectCrypto: 'Select Cryptocurrency',
        selectNetwork: 'Select Network',
        enterAmount: 'Enter Amount',
        withdrawalAddress: 'Withdrawal Address',
        enterAddress: 'Enter your {{crypto}} address',
        quickAmounts: 'Quick Amounts',
        max: 'Max',
        confirmWithdrawal: 'Confirm Withdrawal',
        insufficientBalance: 'Insufficient balance',
        withdrawalSuccess: 'Withdrawal request submitted! Your {{amount}} {{crypto}} withdrawal is pending admin approval.',
        withdrawalError: 'Failed to create withdrawal request. Please try again.',
        invalidAddress: 'Please enter a valid withdrawal address'
      },
      // Transactions
      transactions: {
        title: 'Transaction History',
        subtitle: 'View all your transactions',
        all: 'All',
        deposits: 'Deposits',
        withdrawals: 'Withdrawals',
        investments: 'Investments',
        profits: 'Profits',
        type: 'Type',
        amount: 'Amount',
        status: 'Status',
        date: 'Date',
        time: 'Time',
        noTransactions: 'No transactions found',
        loading: 'Loading transactions...'
      },
      // Common
      common: {
        deposit: 'Deposit',
        withdrawal: 'Withdrawal',
        investment: 'Investment',
        profit: 'Profit',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        active: 'Active',
        completed: 'Completed',
        currency: 'USD',
        connectWalletPrompt: 'Connect Your Wallet',
        connectWalletMessage: 'Please connect your wallet to continue',
        error: 'Error',
        success: 'Success'
      }
    }
  },
  zh: {
    translation: {
      // Navigation
      nav: {
        dashboard: '仪表板',
        investments: '投资',
        copyTrading: '跟单交易',
        deposit: '充值',
        withdrawal: '提现',
        transactions: '交易记录',
        profile: '个人资料',
        connectWallet: '连接钱包',
        disconnect: '断开连接'
      },
      // Dashboard
      dashboard: {
        title: '仪表板',
        subtitle: '欢迎来到您的投资仪表板',
        totalBalance: '总余额',
        allTime: '所有时间',
        totalProfit: '总利润',
        lifetimeEarnings: '终身收益',
        invested: '已投资',
        active: '活跃',
        available: '可用',
        readyToInvest: '准备投资',
        quickActions: '快速操作',
        makeDeposit: '充值',
        requestWithdrawal: '请求提现',
        viewInvestments: '查看投资',
        exploreCopyTrading: '探索跟单交易',
        activePortfolio: '活跃投资组合',
        asset: '资产',
        amount: '数量',
        value: '价值',
        recentTransactions: '最近交易',
        type: '类型',
        status: '状态',
        date: '日期',
        noAssets: '投资组合中没有资产',
        noTransactions: '没有最近的交易',
        loading: '加载中...'
      },
      // Investments
      investments: {
        title: '投资计划',
        subtitle: '为您的投资目标选择完美的计划',
        roi: '投资回报率',
        duration: '持续时间',
        days: '天',
        minInvestment: '最低投资',
        maxInvestment: '最高投资',
        profitInterval: '利润间隔',
        investNow: '立即投资',
        investIn: '投资于',
        enterAmount: '输入金额',
        yourBalance: '您的余额',
        investmentAmount: '投资金额',
        expectedROI: '预期回报率',
        minExpectedReturn: '最低预期回报',
        maxExpectedReturn: '最高预期回报',
        cancel: '取消',
        confirmInvestment: '确认投资',
        loading: '加载计划中...',
        noPlans: '没有可用的投资计划'
      },
      // Copy Trading
      copyTrading: {
        title: '跟单交易',
        subtitle: '跟随专家交易员并自动复制他们的交易',
        expertise: '专长',
        winRate: '胜率',
        totalROI: '总回报率',
        followers: '关注者',
        minAmount: '最低金额',
        verified: '已验证',
        copyNow: '立即跟单',
        startCopying: '开始跟单',
        enterAmount: '输入跟单金额',
        minCopyAmount: '最低跟单金额为 $100',
        yourBalance: '您的余额',
        copyAmount: '跟单金额',
        traderROI: '交易员回报率',
        expectedReturn: '预期回报',
        cancel: '取消',
        confirmCopy: '确认跟单交易',
        loading: '加载交易员中...',
        noTraders: '没有可用的跟单交易员'
      },
      // Deposit
      deposit: {
        title: '充值资金',
        selectCrypto: '选择加密货币',
        selectNetwork: '选择网络',
        enterAmount: '输入金额',
        depositAddress: '充值地址',
        copyAddress: '复制地址',
        addressCopied: '地址已复制！',
        important: '重要提示',
        warning: '仅在 {{network}} 网络上向此地址发送 {{crypto}}。发送其他资产或使用不同网络可能导致永久损失。',
        minDeposit: '最低充值为 10',
        confirmDeposit: '确认充值',
        depositSuccess: '充值请求已提交！您的 {{amount}} {{crypto}} 充值正在等待批准。资金将在管理员确认后到账。',
        depositError: '创建充值请求失败。请重试。'
      },
      // Withdrawal
      withdrawal: {
        title: '提现资金',
        availableBalance: '可用余额',
        selectCrypto: '选择加密货币',
        selectNetwork: '选择网络',
        enterAmount: '输入金额',
        withdrawalAddress: '提现地址',
        enterAddress: '输入您的 {{crypto}} 地址',
        quickAmounts: '快速金额',
        max: '最大',
        confirmWithdrawal: '确认提现',
        insufficientBalance: '余额不足',
        withdrawalSuccess: '提现请求已提交！您的 {{amount}} {{crypto}} 提现正在等待管理员批准。',
        withdrawalError: '创建提现请求失败。请重试。',
        invalidAddress: '请输入有效的提现地址'
      },
      // Transactions
      transactions: {
        title: '交易历史',
        subtitle: '查看您的所有交易',
        all: '全部',
        deposits: '充值',
        withdrawals: '提现',
        investments: '投资',
        profits: '利润',
        type: '类型',
        amount: '金额',
        status: '状态',
        date: '日期',
        time: '时间',
        noTransactions: '未找到交易',
        loading: '加载交易中...'
      },
      // Common
      common: {
        deposit: '充值',
        withdrawal: '提现',
        investment: '投资',
        profit: '利润',
        pending: '待处理',
        approved: '已批准',
        rejected: '已拒绝',
        active: '活跃',
        completed: '已完成',
        currency: '美元',
        connectWalletPrompt: '连接您的钱包',
        connectWalletMessage: '请连接您的钱包以继续',
        error: '错误',
        success: '成功'
      }
    }
  },
  es: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Panel',
        investments: 'Inversiones',
        copyTrading: 'Copy Trading',
        deposit: 'Depósito',
        withdrawal: 'Retiro',
        transactions: 'Transacciones',
        profile: 'Perfil',
        connectWallet: 'Conectar Billetera',
        disconnect: 'Desconectar'
      },
      // Dashboard
      dashboard: {
        title: 'Panel de Control',
        subtitle: 'Bienvenido a tu panel de inversiones',
        totalBalance: 'Saldo Total',
        allTime: 'Todo el tiempo',
        totalProfit: 'Ganancia Total',
        lifetimeEarnings: 'Ganancias de por vida',
        invested: 'Invertido',
        active: 'activo',
        available: 'Disponible',
        readyToInvest: 'Listo para invertir',
        quickActions: 'Acciones Rápidas',
        makeDeposit: 'Hacer Depósito',
        requestWithdrawal: 'Solicitar Retiro',
        viewInvestments: 'Ver Inversiones',
        exploreCopyTrading: 'Explorar Copy Trading',
        activePortfolio: 'Portafolio Activo',
        asset: 'Activo',
        amount: 'Cantidad',
        value: 'Valor',
        recentTransactions: 'Transacciones Recientes',
        type: 'Tipo',
        status: 'Estado',
        date: 'Fecha',
        noAssets: 'No hay activos en el portafolio',
        noTransactions: 'No hay transacciones recientes',
        loading: 'Cargando...'
      },
      // Investments
      investments: {
        title: 'Planes de Inversión',
        subtitle: 'Elige el plan perfecto para tus objetivos de inversión',
        roi: 'ROI',
        duration: 'Duración',
        days: 'días',
        minInvestment: 'Inversión Mínima',
        maxInvestment: 'Inversión Máxima',
        profitInterval: 'Intervalo de Ganancia',
        investNow: 'Invertir Ahora',
        investIn: 'Invertir en',
        enterAmount: 'Ingrese Cantidad',
        yourBalance: 'Su Saldo',
        investmentAmount: 'Monto de Inversión',
        expectedROI: 'ROI Esperado',
        minExpectedReturn: 'Retorno Mínimo Esperado',
        maxExpectedReturn: 'Retorno Máximo Esperado',
        cancel: 'Cancelar',
        confirmInvestment: 'Confirmar Inversión',
        loading: 'Cargando planes...',
        noPlans: 'No hay planes de inversión disponibles'
      },
      // Copy Trading
      copyTrading: {
        title: 'Copy Trading',
        subtitle: 'Sigue a traders expertos y copia sus operaciones automáticamente',
        expertise: 'Experiencia',
        winRate: 'Tasa de Éxito',
        totalROI: 'ROI Total',
        followers: 'Seguidores',
        minAmount: 'Cantidad Mínima',
        verified: 'Verificado',
        copyNow: 'Copiar Ahora',
        startCopying: 'Comenzar a Copiar',
        enterAmount: 'Ingrese Cantidad a Copiar',
        minCopyAmount: 'La cantidad mínima de copy trade es $100',
        yourBalance: 'Su Saldo',
        copyAmount: 'Cantidad a Copiar',
        traderROI: 'ROI del Trader',
        expectedReturn: 'Retorno Esperado',
        cancel: 'Cancelar',
        confirmCopy: 'Confirmar Copy Trade',
        loading: 'Cargando traders...',
        noTraders: 'No hay copy traders disponibles'
      },
      // Deposit
      deposit: {
        title: 'Depositar Fondos',
        selectCrypto: 'Seleccionar Criptomoneda',
        selectNetwork: 'Seleccionar Red',
        enterAmount: 'Ingrese Cantidad',
        depositAddress: 'Dirección de Depósito',
        copyAddress: 'Copiar Dirección',
        addressCopied: '¡Dirección copiada!',
        important: 'Importante',
        warning: 'Solo envíe {{crypto}} en la red {{network}} a esta dirección. Enviar otros activos o usar redes diferentes puede resultar en pérdida permanente.',
        minDeposit: 'El depósito mínimo es 10',
        confirmDeposit: 'Confirmar Depósito',
        depositSuccess: '¡Solicitud de depósito enviada! Su depósito de {{amount}} {{crypto}} está pendiente de aprobación. Los fondos se acreditarán después de la confirmación del administrador.',
        depositError: 'Error al crear la solicitud de depósito. Por favor, inténtelo de nuevo.'
      },
      // Withdrawal
      withdrawal: {
        title: 'Retirar Fondos',
        availableBalance: 'Saldo Disponible',
        selectCrypto: 'Seleccionar Criptomoneda',
        selectNetwork: 'Seleccionar Red',
        enterAmount: 'Ingrese Cantidad',
        withdrawalAddress: 'Dirección de Retiro',
        enterAddress: 'Ingrese su dirección de {{crypto}}',
        quickAmounts: 'Cantidades Rápidas',
        max: 'Máx',
        confirmWithdrawal: 'Confirmar Retiro',
        insufficientBalance: 'Saldo insuficiente',
        withdrawalSuccess: '¡Solicitud de retiro enviada! Su retiro de {{amount}} {{crypto}} está pendiente de aprobación del administrador.',
        withdrawalError: 'Error al crear la solicitud de retiro. Por favor, inténtelo de nuevo.',
        invalidAddress: 'Por favor ingrese una dirección de retiro válida'
      },
      // Transactions
      transactions: {
        title: 'Historial de Transacciones',
        subtitle: 'Ver todas sus transacciones',
        all: 'Todas',
        deposits: 'Depósitos',
        withdrawals: 'Retiros',
        investments: 'Inversiones',
        profits: 'Ganancias',
        type: 'Tipo',
        amount: 'Cantidad',
        status: 'Estado',
        date: 'Fecha',
        time: 'Hora',
        noTransactions: 'No se encontraron transacciones',
        loading: 'Cargando transacciones...'
      },
      // Common
      common: {
        deposit: 'Depósito',
        withdrawal: 'Retiro',
        investment: 'Inversión',
        profit: 'Ganancia',
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
        active: 'Activo',
        completed: 'Completado',
        currency: 'USD',
        connectWalletPrompt: 'Conecte Su Billetera',
        connectWalletMessage: 'Por favor conecte su billetera para continuar',
        error: 'Error',
        success: 'Éxito'
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
