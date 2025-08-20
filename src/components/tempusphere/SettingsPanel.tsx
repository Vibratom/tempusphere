'use client';

import { useSettings, FullscreenSettings } from '@/contexts/SettingsContext';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import Image from 'next/image';

const colorPresets = [
  { name: 'Blue', value: '141 15% 54%' },
  { name: 'Orange', value: '5 41% 49%' },
  { name: 'Green', value: '145 63% 42%' },
  { name: 'Purple', value: '262 84% 60%' },
];

const backgroundPresets = [
    { name: 'Cosmic', url: 'https://placehold.co/1200x800.png', hint: 'galaxy stars' },
    { name: 'Forest', url: 'https://placehold.co/1200x800.png', hint: 'forest trees' },
    { name: 'City', url: 'https://placehold.co/1200x800.png', hint: 'city skyline' },
    { name: 'Abstract', url: 'https://placehold.co/1200x800.png', hint: 'abstract pattern' },
];

export function SettingsPanel() {
  const {
    hourFormat,
    setHourFormat,
    showSeconds,
    setShowSeconds,
    primaryClockMode,
    setPrimaryClockMode,
    primaryClockTimezone,
    setPrimaryClockTimezone,
    primaryColor,
    setPrimaryColor,
    backgroundImage,
    setBackgroundImage,
    clockSize,
    setClockSize,
    fullscreenSettings,
    setFullscreenSettings,
  } = useSettings();
  const { theme, setTheme } = useTheme();

  const handleColorChange = (color: string) => {
    document.documentElement.style.setProperty('--primary', color);
    setPrimaryColor(color);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFullscreenSettingChange = (key: keyof FullscreenSettings, value: boolean) => {
    setFullscreenSettings(prev => ({...prev, [key]: value}));
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h3 className="font-semibold">Appearance</h3>
        <Separator />
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <Label>Theme</Label>
        <RadioGroup value={theme} onValueChange={setTheme} className="flex items-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light"><Sun className="inline-block mr-1 h-4 w-4"/>Light</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark"><Moon className="inline-block mr-1 h-4 w-4"/>Dark</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system">System</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <Label>Primary Color</Label>
        <div className="flex gap-2">
          {colorPresets.map(preset => (
            <Button
              key={preset.name}
              variant={primaryColor === preset.value ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleColorChange(preset.value)}
              style={{ backgroundColor: `hsl(${preset.value})`}}
              aria-label={`Set color to ${preset.name}`}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">General Clock Settings</h3>
        <Separator />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Label>Time Format</Label>
        <RadioGroup value={hourFormat} onValueChange={(value) => setHourFormat(value as '12h' | '24h')} className="flex items-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="12h" id="h12" />
            <Label htmlFor="h12">12-Hour</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="24h" id="h24" />
            <Label htmlFor="h24">24-Hour</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="show-seconds">Show Seconds</Label>
        <Switch id="show-seconds" checked={showSeconds} onCheckedChange={setShowSeconds} />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Primary Clock</h3>
        <Separator />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Label>Clock Mode</Label>
        <RadioGroup value={primaryClockMode} onValueChange={(value) => setPrimaryClockMode(value as 'digital' | 'analog')} className="flex items-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="digital" id="digital" />
            <Label htmlFor="digital">Digital</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="analog" id="analog" />
            <Label htmlFor="analog">Analog</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Label>Timezone</Label>
        <RadioGroup value={primaryClockTimezone} onValueChange={(value) => setPrimaryClockTimezone(value as 'local' | 'utc')} className="flex items-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" />
            <Label htmlFor="local">Local</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="utc" id="utc" />
            <Label htmlFor="utc">UTC</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label>Clock Size</Label>
        <div className="flex items-center gap-2">
          <Slider value={[clockSize]} onValueChange={(value) => setClockSize(value[0])} min={50} max={150} step={10} />
          <span>{clockSize}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 items-start">
        <Label>Background Image</Label>
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                {backgroundPresets.map(preset => (
                    <button key={preset.name} onClick={() => setBackgroundImage(preset.url)} className="relative aspect-video rounded-md overflow-hidden border-2 border-transparent hover:border-primary data-[selected=true]:border-primary" data-selected={backgroundImage === preset.url}>
                        <Image src={preset.url} alt={preset.name} layout="fill" objectFit="cover" data-ai-hint={preset.hint} />
                    </button>
                ))}
            </div>
            <div className="flex gap-2 items-center">
                <Input id="bg-upload" type="file" onChange={handleImageUpload} accept="image/*" className="hidden"/>
                <Button asChild variant="outline">
                    <label htmlFor="bg-upload"><ImageIcon className="mr-2"/> Upload</label>
                </Button>
                {backgroundImage && (
                    <Button variant="ghost" size="icon" onClick={() => setBackgroundImage(null)}>
                    <Trash2 />
                    </Button>
                )}
            </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Full Screen Mode</h3>
        <Separator />
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="fs-primary-clock">Show Primary Clock</Label>
        <Switch id="fs-primary-clock" checked={fullscreenSettings.primaryClock} onCheckedChange={(c) => handleFullscreenSettingChange('primaryClock', c)} />
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="fs-world-clocks">Show World Clocks</Label>
        <Switch id="fs-world-clocks" checked={fullscreenSettings.worldClocks} onCheckedChange={(c) => handleFullscreenSettingChange('worldClocks', c)} />
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="fs-alarms">Show Alarms</Label>
        <Switch id="fs-alarms" checked={fullscreenSettings.alarms} onCheckedChange={(c) => handleFullscreenSettingChange('alarms', c)} />
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="fs-stopwatch">Show Stopwatch</Label>
        <Switch id="fs-stopwatch" checked={fullscreenSettings.stopwatch} onCheckedChange={(c) => handleFullscreenSettingChange('stopwatch', c)} />
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="fs-timer">Show Timer</Label>
        <Switch id="fs-timer" checked={fullscreenSettings.timer} onCheckedChange={(c) => handleFullscreenSettingChange('timer', c)} />
      </div>
    </div>
  );
}
