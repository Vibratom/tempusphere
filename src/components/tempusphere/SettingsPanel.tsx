
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
import { ScrollArea } from '../ui/scroll-area';

const backgroundPresets = Array.from({ length: 100 }, (_, i) => ({
    name: `Image ${i + 1}`,
    url: `/${i + 1}.webp`,
    hint: 'abstract pattern'
}));


function hexToHsl(hex: string): string {
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hsl: string): string {
    if (!hsl) return '#000000';
    const [h, s, l] = hsl.match(/\d+/g)!.map(Number);
    const sDecimal = s / 100;
    const lDecimal = l / 100;
    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lDecimal - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; } 
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }
    
    const toHex = (c: number) => {
        const hex = Math.round((c + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


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
    accentColor,
    setAccentColor,
    lightBackgroundColor,
    setLightBackgroundColor,
    darkBackgroundColor,
    setDarkBackgroundColor,
    backgroundImage,
    setBackgroundImage,
    clockSize,
    setClockSize,
    fullscreenSettings,
    setFullscreenSettings,
  } = useSettings();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
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
  
  const isDark = resolvedTheme === 'dark';

  return (
      <ScrollArea className="h-full flex-1">
        <div className="p-4 space-y-6">
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

          <div className="space-y-2">
              <h3 className="font-semibold">Colors & Background</h3>
              <Separator />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Primary</Label>
              <Input type="color" value={hslToHex(primaryColor)} onChange={(e) => setPrimaryColor(hexToHsl(e.target.value))} className="p-1 h-10"/>
          </div>
           <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Accent</Label>
              <Input type="color" value={hslToHex(accentColor)} onChange={(e) => setAccentColor(hexToHsl(e.target.value))} className="p-1 h-10"/>
          </div>
           <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Background</Label>
               <Input 
                type="color" 
                value={hslToHex(isDark ? darkBackgroundColor : lightBackgroundColor)} 
                onChange={(e) => isDark ? setDarkBackgroundColor(hexToHsl(e.target.value)) : setLightBackgroundColor(hexToHsl(e.target.value))} 
                className="p-1 h-10"
              />
          </div>
          
          <div className="grid grid-cols-2 gap-4 items-start">
            <Label>Background Image</Label>
            <div className="flex flex-col gap-2">
                <ScrollArea className="h-48">
                  <div className="grid grid-cols-4 gap-2 pr-4">
                      {backgroundPresets.map(preset => (
                          <button key={preset.name} onClick={() => setBackgroundImage(preset.url)} className="relative aspect-video rounded-md overflow-hidden border-2 border-transparent hover:border-primary data-[selected=true]:border-primary" data-selected={backgroundImage === preset.url}>
                              <Image src={preset.url} alt={preset.name} fill objectFit="cover" data-ai-hint={preset.hint} unoptimized/>
                          </button>
                      ))}
                  </div>
                </ScrollArea>
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
           <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="fs-converter">Show Converter</Label>
            <Switch id="fs-converter" checked={fullscreenSettings.converter} onCheckedChange={(c) => handleFullscreenSettingChange('converter', c)} />
          </div>
           <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="fs-planner">Show Planner</Label>
            <Switch id="fs-planner" checked={fullscreenSettings.planner} onCheckedChange={(c) => handleFullscreenSettingChange('planner', c)} />
          </div>
           <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="fs-calendar">Show Calendar</Label>
            <Switch id="fs-calendar" checked={fullscreenSettings.calendar} onCheckedChange={(c) => handleFullscreenSettingChange('calendar', c)} />
          </div>
        </div>
      </ScrollArea>
  );
}
