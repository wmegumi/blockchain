import React, { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    // Initialize provider if MetaMask is available
    async function initializeProvider() {
      if (window.ethereum) {
        // 在 ethers v6 中，使用 BrowserProvider 替代 Web3Provider
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethProvider);

        try {
          // 检查是否已连接（用户之前授予访问权限）
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address); // v6 返回完整的账户对象
            const signerInstance = await ethProvider.getSigner(); // v6 中 getSigner 是异步的
            setSigner(signerInstance);
          }

          // 获取网络信息
          const net = await ethProvider.getNetwork();
          setNetwork(net);

        } catch (error) {
          console.error("初始化连接时出错:", error);
        }

        // 监听账户变化
        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            try {
              const signerInstance = await ethProvider.getSigner();
              setSigner(signerInstance);
            } catch (error) {
              console.error("获取签名者时出错:", error);
            }
          } else {
            // 没有账户意味着钱包已断开连接
            setAccount(null);
            setSigner(null);
          }
        });

        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
          // 在网络更改时重新加载页面（刷新状态和合约）
          window.location.reload();
        });
      } else {
        console.warn('未检测到 MetaMask。请安装或启用它。');
      }
    }

    initializeProvider();

    // 清理函数移除事件监听器
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // 助手函数: 连接到 MetaMask 钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('未检测到 MetaMask。请安装它。');
      return;
    }

    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);

      // 请求用户连接钱包
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setProvider(ethProvider);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const signerInstance = await ethProvider.getSigner(); // 异步获取签名者
        setSigner(signerInstance);

        const net = await ethProvider.getNetwork();
        setNetwork(net);
        console.log(`已连接到 ${accounts[0]}，网络 ${net.name}`);
      }
    } catch (err) {
      console.error('钱包连接失败:', err);
    }
  };

  // 助手函数: "断开"钱包（仅清除状态，MetaMask 无法强制断开连
  // Helper: "Disconnect" wallet (just clears state, MetaMask cannot be force-disconnected)
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    console.log('Wallet disconnected');
  };

  return (
    <Web3Context.Provider value={{ provider, signer, account, network, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}
