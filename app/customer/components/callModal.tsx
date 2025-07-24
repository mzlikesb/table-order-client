import { useState } from 'react';
import { X, Droplets, Utensils, Users, HelpCircle, Phone } from 'lucide-react';
import type { CallType, CreateCallRequest } from '../../types/api';
import { i18n } from '../../utils/i18n';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (callData: CreateCallRequest) => void;
  tableId: string;
}

const getCallTypes = () => [
  {
    type: 'water' as CallType,
    name: i18n.t('water'),
    icon: <Droplets size={24} />,
    description: i18n.t('waterDescription')
  },
  {
    type: 'plate' as CallType,
    name: i18n.t('plate'),
    icon: <Utensils size={24} />,
    description: i18n.t('plateDescription')
  },
  {
    type: 'staff' as CallType,
    name: i18n.t('staffCall'),
    icon: <Users size={24} />,
    description: i18n.t('staffCallDescription')
  },
  {
    type: 'other' as CallType,
    name: i18n.t('other'),
    icon: <HelpCircle size={24} />,
    description: i18n.t('otherDescription')
  }
];

export default function CallModal({ isOpen, onClose, onSubmit, tableId }: CallModalProps) {
  const [selectedType, setSelectedType] = useState<CallType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      alert('호출 유형을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        tableId,
        type: selectedType
      });
      
      // 성공 후 모달 닫기
      setSelectedType(null);
      onClose();
    } catch (error) {
      console.error('호출 전송 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="table-card rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Phone size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold table-text-primary">{i18n.t('callService')}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="table-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 호출 유형 선택 */}
          <div>
            <h3 className="text-lg font-medium table-text-primary mb-4">{i18n.t('selectCallType')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {getCallTypes().map((callType) => (
                <button
                  key={callType.type}
                  onClick={() => setSelectedType(callType.type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === callType.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      selectedType === callType.type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 table-text-secondary'
                    }`}>
                      {callType.icon}
                    </div>
                    <div className="text-center">
                      <p className="font-medium table-text-primary">{callType.name}</p>
                      <p className="text-xs table-text-secondary mt-1">{callType.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>


        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {i18n.t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || isSubmitting}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                전송 중...
              </>
            ) : (
              <>
                <Phone size={16} />
                {i18n.t('call')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 