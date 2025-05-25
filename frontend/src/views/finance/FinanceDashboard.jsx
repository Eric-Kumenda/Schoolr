import React from 'react'
import BalanceAndTransactions from './BalanceAndTransactions'

const FinanceDashboard = () => {
  return (
    <>
        <div className="container">
            <div className="row">
                <div className="col col-12">
                    <BalanceAndTransactions/>
                </div>
                <div className="col">
                    
                </div>
            </div>
        </div>
    </>
  )
}

export default FinanceDashboard