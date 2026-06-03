import { name as packageName } from '../../package.json';
import { createScopedUseI18n } from '@epframe/eui-core';

/**
 * 提供 组件化级别的 i18n
 * 作用: 自动添加包名前缀 useI18n 返回的 t 方法中： t('exception.404title') => t('当前包名.exception.404title')
 */
export const useI18n = createScopedUseI18n(packageName);
