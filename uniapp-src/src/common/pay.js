import { requestPayment } from '../platform/weixin/payment.js';

function defaultPaySuccess(response) {
  uni.reLaunch({
    url: `/pages/order/pay-success/pay-success?order_id=${response.data.order_id}`,
  });
}

function defaultPayError(response) {
  uni.redirectTo({
    url: `/pages/order/order-detail?order_id=${response.data.order_id}`,
  });
}

function finishPay(response, callback) {
  if (callback) {
    callback(response);
    return;
  }

  defaultPaySuccess(response);
}

export function pay(response, vm, successCallback, failCallback) {
  if (response.code === -10) {
    vm.showError(response.msg);
    return false;
  }

  if (response.data.pay_type == 20) {
    requestPayment({
      provider: 'wxpay',
      timeStamp: response.data.payment.timeStamp,
      nonceStr: response.data.payment.nonceStr,
      package: response.data.payment.package,
      signType: response.data.payment.signType,
      paySign: response.data.payment.paySign,
      success() {
        finishPay(response, successCallback);
      },
      fail() {
        vm.showError('订单未支付成功', () => {
          if (failCallback) {
            failCallback(response);
          } else {
            defaultPayError(response);
          }
        });
      },
    });
  }

  if (response.data.pay_type == 10 || response.data.pay_type == 40) {
    finishPay(response, successCallback);
  }

  return true;
}

export default pay;
